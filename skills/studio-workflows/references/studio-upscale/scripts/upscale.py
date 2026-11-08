#!/usr/bin/env python3
"""Real-ESRGAN x4plus upscaler — vendored RRDBNet arch (no basicsr dependency),
tiled CPU inference, configurable outscale (net is 4x; final resize to outscale).
Usage: upscale.py IN.jpg OUT.png --outscale 2
Weights: ./RealESRGAN_x4plus.pth (official xinntao release v0.1.0)."""
import argparse, math, sys
from pathlib import Path
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import numpy as np

class ResidualDenseBlock(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Conv2d(nf, gc, 3, 1, 1)
        self.conv2 = nn.Conv2d(nf + gc, gc, 3, 1, 1)
        self.conv3 = nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1)
        self.conv4 = nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1)
        self.conv5 = nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)
    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x

class RRDB(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.rdb1 = ResidualDenseBlock(nf, gc)
        self.rdb2 = ResidualDenseBlock(nf, gc)
        self.rdb3 = ResidualDenseBlock(nf, gc)
    def forward(self, x):
        out = self.rdb1(x); out = self.rdb2(out); out = self.rdb3(out)
        return out * 0.2 + x

class RRDBNet(nn.Module):
    def __init__(self, in_nc=3, out_nc=3, nf=64, nb=23, gc=32, scale=4):
        super().__init__()
        self.scale = scale
        self.conv_first = nn.Conv2d(in_nc, nf, 3, 1, 1)
        self.body = nn.Sequential(*[RRDB(nf, gc) for _ in range(nb)])
        self.conv_body = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up1 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_hr = nn.Conv2d(nf, nf, 3, 1, 1)
        self.conv_last = nn.Conv2d(nf, out_nc, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(0.2, inplace=True)
    def forward(self, x):
        feat = self.conv_first(x)
        out = self.conv_body(self.body(feat)) + feat
        out = self.lrelu(self.conv_up1(F.interpolate(out, scale_factor=2, mode="nearest")))
        out = self.lrelu(self.conv_up2(F.interpolate(out, scale_factor=2, mode="nearest")))
        out = self.lrelu(self.conv_hr(out))
        return self.conv_last(out)

class SRVGGCompact(nn.Module):
    """realesr-general-x4v3 export shape: one Sequential body —
    Conv(3->64), then 32x (PReLU, Conv 64->64) interleaved, final Conv(64->48),
    PixelShuffle(4). Keys validated against the official weights."""
    def __init__(self, nf=64, num_conv=32, scale=4):
        super().__init__()
        layers = [nn.Conv2d(3, nf, 3, 1, 1)]
        for _ in range(num_conv):
            layers += [nn.PReLU(num_parameters=nf), nn.Conv2d(nf, nf, 3, 1, 1)]
        layers += [nn.PReLU(num_parameters=nf), nn.Conv2d(nf, 3 * scale * scale, 3, 1, 1)]
        self.body = nn.Sequential(*layers)
        self.pixel_shuffle = nn.PixelShuffle(scale)
    def forward(self, x):
        return self.pixel_shuffle(self.body(x))

def load_model(weights_path, arch="rrdb"):
    net = SRVGGCompact() if arch == "srvgg" else RRDBNet()
    ckpt = torch.load(weights_path, map_location="cpu", weights_only=True)
    state = ckpt.get("params_ema") or ckpt.get("params") or ckpt
    net.load_state_dict(state, strict=True)
    net.eval()
    for p in net.parameters():
        p.requires_grad_(False)
    return net

@torch.no_grad()
def upscale_tensor(net, img_t, tile=384, pad=16):
    _, _, h, w = img_t.shape
    scale = 4
    out = torch.zeros((1, 3, h * scale, w * scale))
    weight = torch.zeros((1, 1, h * scale, w * scale))
    ys = list(range(0, h, tile)) or [0]
    xs = list(range(0, w, tile)) or [0]
    total = len(ys) * len(xs); n = 0
    for y in ys:
        for x in xs:
            n += 1
            y0, y1 = max(0, y - pad), min(h, y + tile + pad)
            x0, x1 = max(0, x - pad), min(w, x + tile + pad)
            patch = img_t[:, :, y0:y1, x0:x1]
            up = net(patch)
            oy0, oy1 = y0 * scale, y1 * scale
            ox0, ox1 = x0 * scale, x1 * scale
            # feather mask: full weight in the core, ramps across the padded rim
            mh, mw = up.shape[2], up.shape[3]
            ramp_y = torch.ones(mh); ramp_x = torch.ones(mw)
            pr = pad * scale
            if y0 > 0:
                ramp_y[:pr] = torch.linspace(0.1, 1.0, pr)
            if y1 < h:
                ramp_y[-pr:] = torch.linspace(1.0, 0.1, pr)
            if x0 > 0:
                ramp_x[:pr] = torch.linspace(0.1, 1.0, pr)
            if x1 < w:
                ramp_x[-pr:] = torch.linspace(1.0, 0.1, pr)
            m = (ramp_y[:, None] * ramp_x[None, :]).view(1, 1, mh, mw)
            out[:, :, oy0:oy1, ox0:ox1] += up * m
            weight[:, :, oy0:oy1, ox0:ox1] += m
            print(f"  tile {n}/{total}", flush=True)
    return out / weight.clamp(min=1e-6)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("inp"); ap.add_argument("out")
    ap.add_argument("--outscale", type=float, default=2.0)
    ap.add_argument("--arch", choices=["rrdb", "srvgg"], default="rrdb")
    ap.add_argument("--weights", default=str(Path(__file__).parent / "RealESRGAN_x4plus.pth"))
    a = ap.parse_args()
    torch.set_num_threads(4)
    net = load_model(a.weights, a.arch)
    img = Image.open(a.inp).convert("RGB")
    arr = np.asarray(img).astype(np.float32) / 255.0
    t = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0)
    print(f"input {img.size[0]}x{img.size[1]} -> net 4x, outscale {a.outscale}", flush=True)
    up = upscale_tensor(net, t)
    if a.arch == "srvgg":
        # This weights export is a RESIDUAL model: its raw output is zero-mean
        # (white in -> ~0.009 out). The deployed graph adds a bilinear 4x base.
        # Validated 2026-11-03: DC gain ~1.009, bright-area fraction matches source.
        base = F.interpolate(t, scale_factor=4, mode="bilinear", align_corners=False)
        up = up + base
    res = up.squeeze(0).clamp(0, 1).permute(1, 2, 0).numpy()
    out_img = Image.fromarray((res * 255).round().astype(np.uint8))
    if a.outscale != 4.0:
        tw = round(img.size[0] * a.outscale); th = round(img.size[1] * a.outscale)
        out_img = out_img.resize((tw, th), Image.LANCZOS)
    out_img.save(a.out)
    print(f"saved {a.out} {out_img.size[0]}x{out_img.size[1]}", flush=True)

if __name__ == "__main__":
    main()

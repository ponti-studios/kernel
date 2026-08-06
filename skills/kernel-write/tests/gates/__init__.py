from . import intake, direction, draft, critique, edit, approve, transform

STAGES = {
    "intake": intake,
    "direction": direction,
    "draft": draft,
    "critique": critique,
    "edit": edit,
    "approve": approve,
    "transform": transform,
}


def check(stage, text, baseline=None, output_dir=None):
    kwargs = {"baseline": baseline}
    if stage in ("approve", "transform"):
        kwargs["output_dir"] = output_dir
    return STAGES[stage].check(text, **kwargs)

# Complete macOS uninstall

Removing the `.app` and the data directory leaves the thing alive and re-installable. A complete
uninstall is an inventory problem first and a deletion problem second: find every hook (launchd,
browser, keychain, shell, OS privacy), find the *install trigger* that recreates the software, then
delete, then prove it is gone with checks that cannot pass by accident.

## Non-negotiables

1. **Inventory completely before deleting anything.** Run `scripts/inventory.sh <term>` (ships with
   this skill) and read its output. Never delete from a guess about where an app lives.
2. **Find the install trigger, not just the payload.** Deleting an installed artifact while its
   install trigger survives means the OS reinstalls it on next launch. See pitfall 4.
3. **Ask before irreversible destruction.** Confirm scope with the user and offer a backup choice for
   user-authored content. Report size and what will be lost.
4. **Verify with falsifiable checks**, not with the absence of errors. A successful `rm` is not a
   completed uninstall.
5. **Never hand-edit HMAC-protected or consensus-managed state** (Chrome `Secure Preferences`,
   launchd override DB). Remove the trigger and let the owning process reconcile.

## Step 1 — Inventory

```bash
scripts/inventory.sh <term>          # full sweep: binary, dirs, services, browser, keychain, shell
```

Read the output and build an explicit table of: binary path, data dir(s) + sizes, service/plist,
OS support dirs, keychain items, browser integrations, shell rc edits, running processes, open ports.
Read [macos-residue-locations.md](references/macos-residue-locations.md) for the complete location checklist and what each one is.

Two checks that must not be skipped at this stage:

- **Shared-symlink check.** Before `rm -rf` a dotdir, find symlinks *into* it from other tools
  (`find ~ -maxdepth 3 -type l` and grep the target). Prove shared content lives elsewhere by inode:
  `stat -f "%i %N" <pathA> <pathB>` — identical inodes mean the real files survive deletion.
- **Whose binary is it.** Two apps can share a name. Check the full process path before deleting:
  a process called `Chromium` may be the agent's own bundled browser (`~/.hermes/tools/chromium-*`),
  not part of the target at all.

## Step 2 — Stop the software before deleting it

Order matters: a `KeepAlive` launchd job resurrects a binary you delete underneath it, and a running
app rewrites the files you just removed.

```bash
launchctl bootout gui/$(id -u)/<label> || launchctl unload -w ~/Library/LaunchAgents/<label>.plist
sleep 2; launchctl list | grep -i <term>            # bootout can report success while still listed
# then kill survivors by runtime path, excluding your own pid/ppid
```

## Step 3 — Delete, in this order

service plists → app bundle → data dir → OS support dirs → keychain items → browser integrations →
shell rc lines. Concrete path list and per-location commands: [macos-residue-locations.md](references/macos-residue-locations.md).

```bash
security delete-generic-password -s <exact-service-name>      # loop; keychain items outlive the app
tccutil reset All <bundle-id>                                 # no-op if the app never had permissions
```

For the shell, remove the line rather than commenting it, back the rc files up first, and sweep
*every* rc file (`.zshrc`, `.zprofile`, `.zshenv`, `.bashrc`, `.bash_profile`, `.profile`) — the same
line is usually duplicated across all of them.

## Step 4 — Verify

Each check must be able to fail. Run them all and report actual output.

```bash
which -a <binary>                                       # expect: not found
env -i HOME="$HOME" USER="$USER" TERM=xterm /bin/zsh -lic 'echo $PATH' | tr ':' '\n' | grep -i <term>
launchctl list | grep -i <term>                         # expect: nothing
ps -eo pid=,command= | grep <runtime-path>              # self-match proof: see pitfall 2
lsof -nP -iTCP:<port>                                   # expect: nothing listening
security dump-keychain | grep -i <term>                 # expect: 0
find ~/Library/Application\ Support -maxdepth 4 -iname "*<term>*"
sfltool dumpbtm | grep -i <term>                        # background/login-item registry
```

Then state plainly which residue is **inert but present** (tombstones, override rows, text mentions in
unrelated configs) instead of claiming a perfect zero. Inert residue the owning process manages is
correct to leave — say so and say why.

## Pitfalls

1. **Case matters in path matching.** Shell globs (`ls dir/*term*`) and bash's `[[ ]]` are
   case-sensitive, so a target named `Cartograph` is invisible to a sweep for `cartograph` — the
   inventory reports a clean machine while the residue sits there. Use `find -iname` or `grep -i` for
   every name match; never rely on pathname expansion for the search term.
2. **Inherited PATH looks like failed cleanup.** After deleting a PATH line from the rc files, the
   current shell *and the agent's own process* still show the old PATH, because children inherit it.
   Only `env -i … zsh -lic 'echo $PATH'` proves rc-file cleanup. Tell the user new terminals are clean
   and that restarting the host app clears its own process env.
3. **Process greps match themselves.** `ps aux | grep -c '[O]penClaw'` matches the verification
   command's own command line — a false positive that makes a clean machine look dirty. Build the
   needle at runtime (`needle = 'open' + 'claw'`) or exclude the current pid and any `bash -c` wrapper.
4. **Browser extensions installed by another program have a separate install trigger.** A
   third-party-installed Chrome extension (Manifest `location: 6`, `EXTERNAL_PREF_DOWNLOAD`) is
   listed in `~/Library/Application Support/Google/Chrome/External Extensions/<ext-id>.json` with an
   `external_update_url` and often a vendor-ownership marker. Delete only the extension directory and
   Chrome re-downloads it from the webstore on the next launch. Remove, in one pass: that JSON, plus
   `Profile */Extensions/<ext-id>/`, plus `Profile */Local Extension Settings/<ext-id>/`. Chrome then
   uninstalls it itself and leaves a byte-empty tombstone.
5. **Do not edit Chrome `Secure Preferences` by hand.** `protection.macs.extensions` is a single HMAC
   over the whole extension tree; removing one child invalidates it and Chrome can reset *all*
   extension settings. The tombstone an uninstall leaves behind is byte-empty and harmless.
6. **Chrome scratch files are not footprint.** `.com.google.Chrome.XXXXXX` files in a profile are
   stale JSON temp leftovers and match any residue grep (they contain the whole content-settings
   blob, i.e. every site the user ever visited). Check the mtime and leave them alone.
7. **launchd keeps the label after you delete the plist.** `launchctl print gui/$(id -u)` and
   `print-disabled` still list `<label> => enabled`; the DB is root-owned and the row is inert once no
   plist exists. Report it rather than doing surgery on launchd state.
8. **Each browser inspects its own native-messaging directory.** Manifests exist per variant (Chrome,
   Chromium, Chrome for Testing, ChromeForTesting, Edge, Brave, Arc, Vivaldi, Opera, Firefox/Mozilla),
   so sweep `find ~/Library/Application\ Support -maxdepth 4 -name "*.json" -path "*NativeMessaging*"`.
9. **`rm -rf /Applications/Foo.app` needs no sudo** when the bundle is user-owned — check ownership
   before reaching for elevated privileges.
10. **Credentials in the deleted tree must be flagged for rotation.** An uninstall removes a token's
   home but not its validity. Grep the backup for token-shaped files and tell the user to revoke them.
11. **Back up user-authored content, not the program.** Preserve notes, identity/memory files and git
    history; skip runtimes, caches, `node_modules` and session blobs. A 64 MB archive of the real
    content beats a 3 GB archive the user will delete for space.

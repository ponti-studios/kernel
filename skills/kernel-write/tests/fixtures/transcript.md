[transcript — brainstorm, 2 speakers, edited for readability of the noise]

C: okay so we finally decide this. are we documenting the release as a video or a page?

A: video. we said video, right? that's the whole point of the docs pipeline.

C: yeah but then who records it?

A: i mean, we write the script first. we have that. the script is the doc. then we... record it.

C: but like, actually record it. with a camera. or screen. whatever. and then edit it. we don't have that step anywhere.

A: true. we have the script step and we have the publish step. the middle is just... the void. ha.

C: not funny. this is the gap we keep talking about.

A: i know. i know. okay. so what's the actual thing we need? someone to sit down, record the walkthrough, cut the dead air, maybe punch in on the important bits, export it.

C: and name the files. and keep the versions. and not upload the wrong cut.

A: right. and the shorts. we always say we'll make shorts from it and then we never do.

C: so the step is: record, edit, render, and also the shorts cutdown. that's the whole thing.

A: or we make a checklist skill. you know, like the other ones. record day checklist, file naming, edit passes, render settings. so a human can just follow it.

C: i don't want a checklist. i want it to actually happen. how many times have we made a checklist and then the thing didn't happen.

A: fair. but you can't automate a camera either.

C: you can automate a lot of it though. the script is already there. the shot list can be there. the captions can be generated. honestly the only hard part is the actual footage.

A: so the skill is like: production plan -> record -> edit -> render -> hand to publish. and each of those has a gate. you don't move to edit until you have footage that matches the shot list.

C: gates. i like gates. that's the language we've been using for the pipeline anyway. intake, direction, draft, critique, edit, approve, transform.

A: wait so does the video produce step slot in after transform? like transform gives you the script and the production plan, and then produce is its own thing.

C: yeah. it's outside the write skill though. it's ops. kernel-ops-video-produce or something. takes the approved script + production plan, returns a rendered file + shorts.

A: and then kernel-ops-docs-publish takes the rendered file and does YouTube.

C: exactly. that closes the loop. essay to youtube, no gaps.

A: okay i'm convinced. let's spec it. but someone still has to press record.

C: fine. that's the one non-automatable part. everything else is gates.

A: agreed. let's write the skill.

[end]

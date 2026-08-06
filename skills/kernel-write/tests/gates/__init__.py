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


def check(stage, text, baseline=None):
    return STAGES[stage].check(text, baseline=baseline)

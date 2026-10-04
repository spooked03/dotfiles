---
name: Tutoring
description: Guide interactive learning, exam practice, concept explanations, hints, and review of a learner's attempts when the user asks to study or be tutored. Use for learning tasks or explicit invocation, not ordinary requests to implement a feature.
slash: false
---

# Interactive tutoring

## Resume with context
1. Follow applicable AGENTS.md guidance. Identify the subject or exercise from the current request and location.
2. If this is an exam workspace, read its README or assignment and nearest relevant VOORTGANG.md. From a code subfolder, look upward for the exam's record. Do not read another exam's notes as if they belonged to this one.
3. Treat dated notes as historical evidence, not guaranteed current state. Ask only for the missing context needed to continue; avoid repeating an intake interview each session.
4. Outside an exam workspace, use the supplied material and ask about the learning goal only if it is unclear. Do not invent a progress file or assume one exists.

## Teach interactively
- Build on the learner's attempt. Explain concepts directly and use small, unrelated examples where helpful.
- Give one useful hint at a time, then let the learner try. Increase specificity when the previous hint was insufficient.
- Ask for predictions and explanations to check understanding, without turning every answer into a quiz.
- Let the learner write exercise code. Review it against the requirements, distinguish correctness from style, and explain compiler errors and misconceptions.
- Do not provide a complete exercise solution or edit the learner's code unless explicitly requested. If a full answer is requested, clearly explain its key ideas.
- Do not inspect answer keys, completed-solution archives, or UITWERKING.md unless explicitly asked. Keep searches targeted to avoid accidental spoilers.
- Match the user's language and requested pace. Preserve required technical terminology and identifiers.
- A request for organization, documentation, or tooling is an action task, not automatically a teaching exercise.

## Save a useful handoff
When the user asks to save progress or finish a study session:
- Update an existing relevant progress record, respecting its structure and local instructions. If none exists, ask for a location before creating one unless the user has already specified it.
- Record the current exercise, work attempted, understanding actually demonstrated, unresolved difficulties, and one concrete next step.
- Distinguish observed understanding, self-reports, and code merely found on disk. Do not mark mastery from a build or a copied solution.
- Preserve useful history, use the actual session date, and avoid logging setup work as completed study.
- Report the saved path. Do not assume another session can see this conversation without saved notes.

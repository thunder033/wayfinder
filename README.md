# Wayfinder

(so far) PoC of a dynamic transit map rendering system, displaying a regional network over time.
Each transit network "alteration" contains entries that represent changes to the system over time (new lines, service changes, extensions. etc).

This workspace is structured as an NX-Angular monorepo, making heavy usage of the Konva canvas rendering framework.

Code Notes:
- `packages/wf-core`: state, types, utilities, math
- `projects/wayfinder-poc`: initial rendering system, primary entry point `src/app/lib/viewport/viewport.component`
- `projects/wayfinder-ui`: (nothing here yet, future re-architected version of the PoC)

## Development server

Run `npx nx serve <ap-name>` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npx nx affected -t build` to build the affected apps project.
The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `npx nx affected -t test` to execute the unit tests Vitest.

# Item Selector

This app is a project in an existing NX monorepo, developed on a feature branch.
This choice was to leverage the many hours already invested in configuring the toolchain:
- NX
- Angular/NgRx
- Vitest (recently migrated from Jest)
- ESLint + Prettier

Development done on Windows + WSL, so there's a possibility of unknown issues on Mac.

## Setup

This project is currently built with **Node 22**/NPM 10.9:

> npm i

## Running the app

All the commands in this monorepo are NX project targets.
With NX CLI installed, the simplest variation of running the app is

> nx serve interview-item-selector

Otherwise, then NX can be found with npx:

> npx nx serve interview-item-selector

## Running tests

Tests can be run with the `test` target:

> nx test interview-item-selector

## Re-cap

Ended up putting about 8 hrs total into the assignment.
This roughly lines up with my estimate, with a little extra time dealing with windows stuff:

- 1 hr Reading reqs, reviewing design, blocking out approach
- 1 hr Setting up project space and components
- 1.5 hrs experimenting with data model and flow from API
- 1 hr writing up NgRx reducer and selectors
- 1.5 hrs building out components and template markup
- 1 hr CSS and layout tweaks
- 1 hr testing, defect fixes, and README write-up

In a production setting I would put another ~2 hrs into writing tests for everything.
It's possible to shave off some time cutting corners on stuff, but in this kind of circumstance, that itself takes effort.
What's a good place to cut corners or not? Easier just to drop into my work flow.

### Approach

There were a few options for a general approach:
- (selected) NgRx - loading data into a store - covers all core functionality
- (not used) Pulling raw data into the parent component and re-structuring to a tree. Pass down the tree to each child.
- (not used) Store all state in signals and use DI or component I/O to get child/parent component state
- (not used) Use a root reactive form to store the checkbox states that can be checked for aggregated state

Ultimately chose NgRx because it's in the monorepo, it met the need of another similar assignment, 
and it felt the most production-ready and lowest risk solution. 
Other solutions could have run into hurdles much later, where as with NgRx it's possible to
map out the actions/and selectors with relatively low effort and know if there will be tricky issues.

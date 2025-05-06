# Item Selector

## Setup

This project is currently built with **Node 22**/NPM 10.9. All commands can be run from the root of the monorepo:

> npm i

Development done on Windows + WSL, so there's a possibility of unknown issues on Mac.
As noted below, this app is also part of an existing monorepo.

## Running the app

All the commands in this monorepo are NX project targets.
With NX CLI installed, the simplest variation of running the app is

> nx serve interview-posts-grid

Otherwise, then NX can be found with npx:

> npx nx serve interview-posts-grid

## Running tests

Tests can be run with the `test` target:

> nx test interview-posts-grid

While the tests run, something is off with the test runner setup because it won't extra accept arguments and using `.only` breaks things.

## Approach

This app is a project in an existing NX monorepo, developed on a feature branch.
This choice was to leverage the many hours already invested in configuring the toolchain:
- NX
- Angular/NgRx
- Vitest (recently migrated from Jest)
- ESLint + Prettier

Also extended/repurposed another [code sample](https://github.com/thunder033/wayfinder/tree/interview-item-selector) 
that ended up with much more [extensive usage of NgRx](https://github.com/thunder033/wayfinder/blob/interview-item-selector/projects/interview-item-selector/src/lib/state/item-selector.reducer.ts).

A few areas of the solution include explanatory comments (though I generally aim for self-descriptive code).
Most specifically there's some notes on Angular component harness/"setup" method, in post.component.spec/harness.
Overall felt the requirements/constraints led to a pretty straightforward set of decisions.

I generally took a signals-first approach unless that seemed a bit clunky.
Definitely simplified a lot of the component basics over RxJS and the interoperability 
when observables are needed seems solid enough.

I gave Webstorm's local AI auto-complete another shot, but I will probably disable that again.
It gave a few helpful suggestions, but mostly generates only plausible nonsense still.

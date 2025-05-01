# Item Selector

This app is a project in an existing NX monorepo, developed on a feature branch.
This choice was to leverage the many hours already invested in configuring the toolchain:
- NX*
- Angular/NgRx
- Vitest (recently migrated from Jest)
- ESLint + Prettier

*This project is developed on Windows, and some issues with the NX DB & npm have been encountered in this repo.
In particular an [issue with NX DB](https://github.com/nrwl/nx/issues/30856) causes most NX commands to fail.
I don't have a Mac, so it's unknown if the same (or different) issues would arise.

## Setup

This project is currently built with **Node 22**/NPM 10.9:

> npm i

## Running the app

All the commands in this monorepo are NX project targets.
With NX CLI installed, the simplest variation of running the app is

> nx serve interview-item-selector

Otherwise, then NX can be found with npx:

> npx nx serve interview-item-selector

Because of previously mentioned issues with (Windows?) NX DB, the cache needs to be disabled.
There's a helper npm command since NX didn't seem to pick up any env config stored in files for this property:

> npm run nx serve interview-item-selector

It will give a warning about the option being removed in the next NX release, but should otherwise launch the app on `localhost:4200`

## Running tests

Tests can be run with the `test` target (above NX caveats apply):

> nx test interview-item-selector

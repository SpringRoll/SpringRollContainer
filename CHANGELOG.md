# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [2.3.4] 2022-06-09

## Changed

- Bumped path-parse dependency from 1.0.6 to 1.0.7
- Bumped glob-parent dependency from 5.1.1 to 5.1.2

## [2.3.3] 2022-05-05

## Changed

- Bumped ansi-regex dependency from 3.0.0 to 3.0.1

## [2.3.2] 2022-04-14

## Fixed

- re-re-named UserDataPlugin onUserDataRead and onUserDataRemove parameters from 'name' to 'data' to match Bellhop

## [2.3.1] 2022-03-10

### Fixed

- replaced `return` with `continue` in set up plugin function

## [2.3.0] - 2022-03-03

### Added

- Added context object to Container to allow data sharing between Container and plugins

## Changed

- Bumped karma dependency from 5.2.3 to 6.3.14

## [2.2.5] - 2022-02-03

- Upgraded follow-redirects dependency for security alert

## Fixed

- Fixed error when reporting a plugin preload failure

## [2.2.4] - 2021-06-04

## Changed

- Minor dependency version updates

## [2.2.3] - 2021-05-21

## Changed

- updated `singlePlay` response to not return an object containing the boolean, but just the boolean itself.

## [2.2.2] - 2021-05-05

## Changed

- Updated comments and docs to be more accurate and up to date

## [2.2.1] - 2021-03-04

### Changed

- socket.io dependency version bump

## [2.2.0] - 2021-02-19

### Added

- Indexeddb additions to the userdata class

### Changed

- update NPM modules to remove security vulnerabilities
- This CHANGELOG
- Fullscreen Plugin. The ability to add in a fullscreen button within container
- Fullscreen Plugin Automated Testing
- Fullscreen Plugin Documentation
- Indexeddb additions to the userdata class
- update NPM modules to remove security vulnerabilities

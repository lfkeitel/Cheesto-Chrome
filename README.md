Cheesto User Status Extension v0.2.0
=====================================

This extension interfaces with Dandelion's public API to display
the current status of users in Cheesto.

Requirements
------------

* Chrome
* Dandelion v5+

Is it any good?
---------------

[Yes](https://news.ycombinator.com/item?id=3067434)

Use Instructions
----------------

1. Right click the extension icon
2. Click Options
3. Enter the domain name or IP of your Dandelion instance
4. Enter your API Key from Dandelion (found under Settings -> API Key in Dandelion)
5. Click Save Options
6. Click the extension icon to see user statuses

Build Instructions
------------------

1. Clone this git repo
2. In Chrome, enable developer mode
3. Click "Load unpacked extension" in extension management
4. Navigate to the folder where you cloned the repo

Release Notes
-------------

Upcoming

- Option to save and load synced settings
- Set your current status (API needs to be written first)

v0.2.0

- Options page is now styled
- Regex replace to:
  - Remove trailing slashes from address
  - Remove trailing whitespace from address and api key
- Settings are local by default

v0.1.0

- Initial release to beta test group

Versioning
----------

For transparency into the release cycle and in striving to maintain backward compatibility, Dandelion is maintained under the Semantic Versioning guidelines. Sometimes we screw up, but we'll adhere to these rules whenever possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

And constructed with the following guidelines:

- Breaking backward compatibility **bumps the major** while resetting minor and patch
- New additions without breaking backward compatibility **bumps the minor** while resetting the patch
- Bug fixes and misc changes **bumps only the patch**

For more information on SemVer, please visit <http://semver.org/>.

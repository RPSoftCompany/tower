---
description: Configuration page is where users can view or modify their configurations
---

# Configuration

### Overview

In Tower, a configuration refers to a collection of key/value variables organized within a defined hierarchical structure. For instance, if we'd refer to our [example](../how-to-start/example.md), you can craft a configuration for the "App1" application within the "Development" environment and under the "A" technology, constituting one configuration instance. Similarly, creating a comparable configuration for "App2" application within the same technology and environment would represent another configuration instance.

At the same time, every configuration instance retains a record of all modifications applied to it. This allows users to review or revert to any previous configuration instance whenever necessary.

Another advantage of employing a hierarchical structure is the ability to store configuration components across different tree levels. This facilitates the sharing of configuration variables among various applications.

### How to create your first configuration?

<figure><img src="../.gitbook/assets/Peek 2024-03-29 13-24.gif" alt=""><figcaption><p>How to create configuration using Tower</p></figcaption></figure>

Creating a configuration instance in Tower is straightforward. Simply navigate to your desired configuration path (as demonstrated in the video above) and add the necessary configuration variables. Then, click the "Save configuration" button, and your configuration is securely stored.

### Configuration versioning

Configurations for your application may evolve over time due to various factors such as new releases, feature enhancements, or changes in API URLs. Tracking and recalling these modifications can be challenging. Fortunately, Tower offers a solution. On the configuration page, you can easily compare your current configuration instance with previous iterations. If issues arise with your current configuration—whether due to mistakes, testing, or incorrect values—you have the option to revert to a previous configuration instance or selectively restore specific variables.

#### History reviewing and reverting variables

To navigate through all the configuration versions, access your configuration instance on the configuration page. Click the left arrow button to move to the previous configuration or the right arrow button to proceed to the next one. If you need to revert to any variable from a specific version, simply click on the "undo" button next to the corresponding configuration variable (as demonstrated in the video below).

<figure><img src="../.gitbook/assets/Peek 2024-03-29 14-09.gif" alt=""><figcaption><p>History reviewing and reverting variables</p></figcaption></figure>

You can also go back to one of the previous configuration instances just by clicking the "undo" button next to the configuration version.

<figure><img src="../.gitbook/assets/configuration_revert.gif" alt=""><figcaption><p>Full configuration revert</p></figcaption></figure>

### Variable types

Each configuration, just like each application is different. And at the same time, each application needs configuration data in different format. That's why Tower supports multiple variable types, from simple onse, like string complex lists or collecting data from AWS Secrets Manager.

<figure><img src="../.gitbook/assets/configuration_types.gif" alt=""><figcaption><p>Variable types</p></figcaption></figure>


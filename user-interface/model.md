# Bases

## Overview

On the Bases page, you can add, remove, or modify configuration bases. However, before delving into the page details, it's important to understand what bases are.\
In Tower, bases serve as fundamental components within the configuration hierarchy. They represent key elements of the configuration path, providing a structured framework for organizing and managing configuration data.\
Bases can encompass various aspects of the configuration environment, such as technology stacks, development stages (e.g., development, testing, production), or specific applications. By defining bases, users establish a logical structure that helps streamline configuration management and ensure consistency across different settings.\
For example, consider an organization that develops software applications using different technologies (e.g., Python, Node.js, Java). Each technology stack could be represented as a base within Tower's configuration hierarchy. Within each technology base, further subdivisions might exist for different environments (e.g., development, testing, production), specific applications, etc.

### How to create a new Base

To create a new base instance, navigate to the input field at the top of the screen and enter a descriptive name for your base. This could be a technology stack, a development stage, or any other category relevant to your configuration structure. Once you've entered the name, simply click on the plus button located on the right side of the input field then click the Save changes button.

<figure><img src="../.gitbook/assets/base_create (1).gif" alt=""><figcaption><p>Add new base instance</p></figcaption></figure>

## Additional functionality

Bases serve a dual purpose beyond merely providing hierarchy; they can also incorporate rules and restrictions.

### Rules

Rules are a powerful functionality within Tower, offering the capability to validate configuration variables. By implementing rules, Tower can prevent the input of invalid or restricted values, ensuring the integrity and accuracy of your configurations. This feature not only enhances the reliability of your configuration data but also contributes to the overall robustness and security of your system.

#### Overview

Creating rules, much like the functionality itself, may initially seem complex. To ease into the process, let's break down the role of each input and its impact on the rule's functionality.\
Let's begin by dividing the input into three distinct sections. \
The first section focuses on identifying the rule target, specifically the configuration variables that will undergo validation.\
The second section is the heart of the rule and identifies the validation that will be performed on the target identified by the first section.\
The second section considered the core of the rule, determines the validation criteria applied to the configuration variables identified in the first section.\
The final section is where you define the error message that will be displayed when a configuration variable fails validation.

<figure><img src="../.gitbook/assets/Rules_overview (3).png" alt=""><figcaption><p>Rules overview</p></figcaption></figure>

The first section (highlighted in red) can be subdivided into three distinct inputs: target type, target value, and input validation method. \
The target type input specifies what will be validated as the target value—whether it's a configuration variable name or type.\
The next input, "target value," is a text field where you can input the expression (either as full text or a regular expression) to specify which configuration variable will be the target of this rule's validation.\
The input validation method is the final field in this section, indicating whether the rule uses a specific text value or a regular expression to identify the configuration variable that will undergo the validation.

The second section (highlighted in blue), like the previous one, can be divided into three sections: condition type, condition value, and condition method. This section resembles the previous one but specifies the condition that the configuration variable's value or type must met.

The final section (highlighted in yellow) comprises a text field and a button. In the text field, you can input the error message that will appear when the rule is not met during the configuration creation process. Clicking the "+" button adds the rule to the current base.


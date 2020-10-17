# Overview

As Tower was designed with simplicity in mind, everything from configuration creation to Towers administration, can be done via included user interface.  
Towers user interface is exposed as a web application and, by default, you can find it on port 5000. But if your administrator changed the port setting in [config.json](../installation-1/configuration.md#config-json), then you should ask him for the exect url.

### Ideology

Tower user interface is based on the idea, that almost everything done by user should be saved automaticaly. In other words, when you change something in Tower, those changes will be saved without clicking on any button. Of course this way of thinking may be a problem when user is not caution. Therefore Tower puts great emphasis on the control and user permissions. So in case of any issue, you will know, who, when and how changed the configuration and you will be able to revert it with one click.

### Basics

Towers menu is divided into four different sections, configuration, archive , models and settings. 

#### Configuration

With only one item, configuration section is the smallest, but at the same time most powerfull section in Tower. Clicking on it will redirect you to [configuration](configuration.md) view.

#### Archive

This section is for checking and comparing configurations. Right here, you can find two items, [version archive](version-archive.md) and [time archive](time-archive.md).

#### Models

Models section is providing all [model](model.md) configuration items, also it's the only dynamic section in Tower. It means, that depanding on configuration, items will appear in this section.

#### Settings

[Settings](settings.md) is administrator only section. It contains one item, where all the Tower inner configuration can be found.  





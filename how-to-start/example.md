# Example

The easiest way to walk you through how Tower works, is to show it on an example.  
So, for now, lets assume, that your organization uses three different technologies A,B and C, and all of those technologies has three different environments, which can be categorized as Dev, Test and Prod. Of course, each of those technologies has different instances/applications.  
So from the configuration perspective, you've got three different trees. The first one is for technology A, with three environments and applications for each environment. The same for technology B and C.

To create such structure in Tower, we'll need to start from creating [Base Configuration](../models/base-configuration.md).   
Base Configurations represent your tree structure, in our case we'll have three Base Models: Technology, Environment and Application.

So, we've got our structure defined. Now, we can fill it with content... We need to add three entries to our Technology: A, B and C. Another three entries \(Dev, Test, Prod\) should be added to Envrionment and in the end, all the applications should be added.  


And that is it. Tower is ready to use and you can start creating configuration for your applications.  



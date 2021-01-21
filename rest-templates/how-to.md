# How To

REST Templates are the most complex feature of Tower, but at the same time, it's not easy to create template with all the features you need and especially your application needs.

But let's start with basics... Default template looks like this:

```javascript
{
%%forEach var in variables%%
	"%%var.name%%":"%%var.value%%"
%%forEach END%%
}
```

Overall it means, that you will receive all the variables in your configuration as a JSON output. But let's go into details.

### Overview

Tower has a set of functions and variables that can be used inside templates. Each of those activities are closed by two percent signs '%%'. So every time a Tower interpreter encounters '%%' signs, it is looking for matching function or variable. After processing such input, Tower will replace given expression with its output.

### Variables

Each configuration variable in Tower has its name, type and value. And each of those parameters can be written inside your template. The easiest way to do so, is use variable name, to obtain the variable value, like this:

```javascript
%%variables["variableName"]%%
```

You can use this anywhere you want. Inside any loop or if clause. But of course in many cases it's not the way to go.  
Look at the third line of our example:

```javascript
	"%%var.name%%":"%%var.value%%"
```

You can see, that right here were using the var as a variable name and _name_ or _value_ as a parameter what kind of information we want to obtain. All we need to remember is to add two percent signs at the begging and end of the variable clause. You can find the example of variables usage below:

```javascript
%%var.name%%
%%var.type%%
%%var.value%%
```

Of course, you can ask why variables are called _var_ and will it be like this in all the cases and you can learn about it from [forEach loop](how-to.md#foreach-loop), [if clause](how-to.md#if-clause) and [defind own varialbes](how-to.md#define-own-variables) paragraphs. 

### ForEach loop

One example of Tower expressions is a _ForEach_ loop. This directive alows you to iterate through the variables inside your configuration and write them in any way you want.  
An example of such expression can be found in the default template lines two to four:

```javascript
%%forEach var in variables%%
	"%%var.name%%":"%%var.value%%"
%%forEach END%%
```

Each iteration of the loop assigns current variable from configuration to Towers variable called, in this example, _var_. So inside this _forEach_ clause you can use _var_ as a configuration variable representation. Of course you can use any name you like, but for the sake of this documentation we'll use name _var._

_ForEach_ statement has three different representations and functionality. The first one "_ForEach in_" is the one you can see in the previous example `%%forEach var in variables%%` the only thing that can change in this version is variable name.  
The second _ForEach_ statement, "_ForEach of_" looks like this:

```javascript
%%forEach var of variables["[0-9]+"]%%
```

There are few differences. The first one is the _in_ word is replaced with _of ._ The second thing is a regular expression after variables word.  
This regular expression matches the variable names and your loop will contain only those variables.

The third _ForEach_ clause is used for the list variables to iterate through them:

```javascript
%%forEach var in list["listVariableName"]%%
```

You can find more examples of ForEach clauses below:

```javascript
%%forEach variable1 of variables[`[A-Za-z]+`]%%
%%forEach END%%

%%forEach variable2 of variables['^[A-Z]+$']%%
%%forEach END%%

%%forEach variable3 in list['listVariable']%%
%%forEach END%%
```

### If clause

The _if_ clause in Tower works in a very simple maner, if the condition is met, write the content of the clause:

```javascript
%%if var.name == "test"%%
    my content
%%if END%%
```

So, if the _var_ name equals _test_, __then `my content` will be written, in other case, the output will be empty.  
Of course, you can add the _else_ to the clause, like this:

```javascript
%%if var.name == "test"%%
    my content
%%ELSE%%
    my other content
%%if END%%
```

In case if the _var.name_ is not equal _test_, Tower will write `my other content` as the output.

The _if_ statement gives you the ability not only to check if variables are equal, but also to use any of the following checks:

#### **less** than or **equal** to

```javascript
%%if var.value <= "10"%%
    my content
%%if END%%
```

#### greater than or **equal** to

```javascript
%%if var.value >= "10"%%
    my content
%%if END%%
```

#### **less** than

```javascript
%%if var.value < "10"%%
    my content
%%if END%%
```

#### greater than

```javascript
%%if var.value > "10"%%
    my content
%%if END%%
```

#### not equal

```javascript
%%if var.value != "test"%%
    my content
%%if END%%
```

#### Match regular expression

```javascript
%%if var.value =~ "^[A-Z]+"%%
    my content
%%if END%%
```

You can also use `variables["variableName"]` known from the _forEach_ statement inside the _if_ clause

```javascript
%%if variables["variableName"] == "test"%%
    my content
%%if END%%
```

### Define own variables

In Tower you can even create your own variables, for example, if you want to use the same value in many places

```javascript
%%def myVariable=test%%
```

After such line, you can use variable called _myVariable_ anywhere you like, for example in the if statement

```javascript
%%def myVariable=1%%
%%if myVariable.value == "1"%%
    my content
%%if END%%
```

### Functions

The latest addition introduced in Tower is _function_. You can use functions to change or create variables.  
Here's the list of currently available methods in Tower:

#### tower\_toBase64

This method changes the given string into the base64 encoded value.

```javascript
{
%%forEach var in variables%%
	"%%var.name%%":"%%tower_toBase64(%%var.value%%)%%"
%%forEach END%%
}
```

####  tower\_random

Generates a random number. This function can be used in two different ways, the first one is without any parameters and it will return the value from 0 to 99. And the second way, with two parameters, where first one is a minimum value and the second one is a maximum.

```javascript
//Without parameters
"%%var.name%%":"%%tower_random()%%"

//With parameters
"%%var.name%%":"%%tower_random(1, 5)%%"
```

#### tower\_substring

Returns a substring of a given value. This method accepts two or three different parameters. The first one is the string you want to use, the second is a starting character index and the third one \(optional\) is the end index.

```javascript
//With three parameters
"%%var.name%%":"%%tower_substring(%%var.value%%,0,5)%%"

//With two parameters
"%%var.name%%":"%%tower_substring(%%var.value%%,2)%%"
```

#### tower\_length

Returns the length of the given string

```javascript
"%%var.name%%":"%%tower_length(%%var.value%%)%%"
```

#### tower\_indexOf

Returns the index of the given value in the string.

```javascript
"%%var.name%%":"%%tower_indexOf(%%var.value%%, test)%%"
```


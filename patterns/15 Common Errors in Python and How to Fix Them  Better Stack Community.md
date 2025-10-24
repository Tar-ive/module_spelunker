---
title: "15 Common Errors in Python and How to Fix Them | Better Stack Community"
source: "https://betterstack.com/community/guides/scaling-python/python-errors/"
author:
  - "[[Better Stack]]"
published: 2023-11-14
created: 2025-10-24
description: "Dealing with errors is a significant challenge for developers. This article looks at some of the most common Python errors and discusses how to fix them"
tags:
  - "clippings"
---
[Back to Scaling Python Applications guides](https://betterstack.com/community/guides/scaling-python/)

- Excessive use of global variables.
    
- Spaghetti code
    
- Using comments to compensate for poor names
    
- Using magic numbers and strings (hard-coded constant values without explanation)
    
- Inadequate Error Handling, such as using generic exceptions, or catching exceptions and ignoring them without proper handling
    
- Excessive nesting of loops and `if` statements
    
- Overusing List Comprehensions at the expense of readability
    
- Not considering more efficient algorithms to solve problems
    
- Not using tests
    
- Inadequate documentation
    
- Ignoring PEP 8 and the Zen of Python
    
- Inappropriate data structures, such as using a list where a dict would be more suitable
    
- Not utilizing Pythonic idioms
    
- Not using context managers when appropriate
    
- Indenting with tabs rather than 4 spaces
    
- Avoidance of classes
    
- God classes
    
- Repetition / duplicated code
    
- Catching exceptions and ignoring them without proper handling
    
- Methods that are are not directly related to the class they are in, or classes with multiple responsibilities
    
- Reinventing the wheel. Python has an extensive standard library which makes custom code for common tasks unnecessary
    
- Not using version control
- 
## 15 Common Errors in Python and How to Fix Them

Stanley Ulili

Updated on November 20, 2024

When building Python applications, it's a given that you'll run into errors. Learning to identify and fix these errors is essential for effective debugging, time-saving, and more importantly, avoiding such errors in the future.

This article presents a collection of 15 frequent Python errors and their solutions. Although this list doesn't encompass all possible Python errors, it aims to acquaint you with common problems, equipping you to deal with them as they arise.

![](https://www.youtube.com/watch?v=mvWYdrn7m2c)

## 1\. SyntaxError

`SyntaxError` is a common error that occurs when the Python interpreter parses your code and finds incorrect code that does not conform to the syntax rules. Some common causes of `SyntaxError` include:

- Unclosed strings
- Indentation issues
- Misusing the assignment operator (`=`)
- Misspelling Python keywords
- Missing brackets, parentheses, or braces
- Using newer Python syntax on an old version of Python.

When this error occurs, a traceback is produced to help you determine where the problem is. Take the following example:

On line 1, the syntax is invalid because the dictionary's first property lacks a colon (`:`) to separate the property `"pam"` and the value `30`. When the code is executed, the following traceback is produced:

The traceback message has multiple carets (`^`) showing where the invalid syntax was encountered. While it sometimes might not pinpoint the exact location, it will usually hint at the issue's probable location.

To address this issue, carefully consider the following information in the traceback:

- File name
- Line number
- Location indicated by the caret (^)
- Error message, which can offer insights into the nature of the problem.
- The question added at the end of the error message provides valuable context.

To catch syntax errors before you execute the code, configure a linter within your code editor, such as [Pylint](https://pypi.org/project/pylint/),[Flake8](https://flake8.pycqa.org/) to statically analyze the code.

In the screenshot below, Pylance is used to highlights problematic areas with a red underline in VS Code:

![Screenshot of Pylance highlighting an error](https://imagedelivery.betterstackcdn.com/xZXo0QFi-1_4Zimer-T0XQ/44ba7203-d0ce-4d5e-b62a-6d6dd6343300/md1x)

Screenshot of Pylance highlighting an error

## 2\. IndentationError

The `IndentationError` occurs in Python when there's an indentation issue in your code. Common causes include mixing tabs with spaces, incorrect spacing, incorrectly nested blocks, or whitespace at the beginning of a statement or file.

Consider the following example:

This triggers a Python traceback similar to:

To address and prevent this issue, use an editor or IDE configured with formatters like [Black](https://github.com/psf/black), which auto-formats your code as you write. The previously mentioned Pylance linter can also help you identify indentation errors:

![Screenshot of a linter identifying indentation errors](https://imagedelivery.betterstackcdn.com/xZXo0QFi-1_4Zimer-T0XQ/57c3d6cc-5733-46e1-7b10-139d5d808a00/md1x)

Screenshot of a linter identifying indentation errors

## 3\. NameError

Python raises a `NameError` if you attempt to use an identifier that hasn't been defined or might be out of scope. Other potential causes of a `NameError` include referencing a variable before its assignment or misspelling an identifier:

In this example, the `name` variable is not defined but is being accessed. As a result, Python throws an exception:

To fix this problem, ensure that the variable or function name you want to use has been defined. Check for spelling errors and ensure that the variable you want to use is within the scope where it is being accessed.

Again, setting up a linter in your editor will help you catch such problems error early in the development process:

![Screenshot of Pylance detecting a `NameError` in the code`](https://imagedelivery.betterstackcdn.com/xZXo0QFi-1_4Zimer-T0XQ/1bacae80-23ad-40b0-682b-0800a5e89200/md1x)

Screenshot of Pylance detecting a \`NameError\` in the code\`

## 4\. ValueError

The `ValueError` exception indicates that a function received an argument of the correct data type; however, the value itself is invalid. For example, the `int()` method accepts only integer string like `"42"`, and passing something like `"forty-two"` will yield a `ValueError`:

This leads to Python throwing an exception like this:

Another common cause is passing an empty iterable to the `max()` or `min()` built-in functions, e.g., `max([])`.

To resolve this issue, provide the correct data type and value as an argument to the built-in functions. Check the documentation for the specific function you're using to ensure compliance with expected input formats.

If applicable, consider using `try-except` blocks, to gracefully manage potential user input errors and prevent `ValueError` occurrences that bring down your entire program.

## 5\. UnboundLocalError

The `UnboundLocalError` often occurs when you use a local variable within a function or method before assigning a value to it. For example, referencing the `name` variable before setting its value:

You will see an exception resembling this:

Other common causes for this error include:

- A local variable in a function having the same name as a global variable, known as [shadowing a global variable](https://en.wikipedia.org/wiki/Variable_shadowing#:~:text=In%20computer%20programming%2C%20variable%20shadowing,is%20known%20as%20name%20masking).
- Using the `del` operator on a local variable that you referenced later.

To fix `UnboundLocalError`:

- Assign values to local variables before referencing them.
- If caused by shadowing a global variable, use a name different from the global variable.
- Avoid using the `del` operator on variables you will reference later.

## 6\. TypeError

A `TypeError` exception in Python indicates that you are performing an operation that is not supported or appropriate for the object data type. For example, trying to divide a string with an integer:

This produces an exception that looks like the following:

This exception can also occur in situations like trying to loop over a non-iterable (such as a float or integer) or using incorrect argument types for built-in methods (like passing an integer to `len(),` which expects an iterable). Furthermore, calling a function with fewer arguments than required or comparing different data types can also lead to a `TypeError`.

To avoid these errors, ensure the following:

- Only iterate through iterable sequences.
- Use arguments that match the expected types in built-in functions.
- Supply the correct number of arguments when calling a function.
- Compare or convert to a common type when dealing with different data types.[The fastest log  
search on the planet](https://betterstack.com/telemetry?utm_content=upsell&utm_medium=guides&utm_source=community&utm_term=python-errors)

[

Better Stack lets you see inside any stack, debug any issue, and resolve any incident.

](https://betterstack.com/telemetry?utm_content=upsell&utm_medium=guides&utm_source=community&utm_term=python-errors)

## 7\. UnicodeError

A `UnicodeError` exception is raised when Python encounters encoding or decoding issues. The reasons for this error include:

- Conflicts due to mixed encoding in the text.
- Incorrect byte order marks (BOM) leading to decoding errors.
- Use of unsupported or mismatched encoding schemes.
- Conflicts arising from different Unicode standards.
- Problems with surrogate pairs in UTF-16.
- Corrupted or incomplete byte sequences.

Consider this example where decoding a Unicode string with ASCII results in an error:

To mitigate such issues, use a reliable encoding like UTF-8 and ensure strings are valid Unicode. Implementing error-handling strategies like try-except blocks can also help manage encoding errors. Additionally, pay attention to Byte Order Marks when working with files or data streams, and inspect the encoding and character standards of external data sources.

## 8\. ZeroDivisionError

Python raises the `ZeroDivisionError` exception when you attempt to divide a number by zero:

Python will throw the following exception:

To fix this, avoid dividing numbers by zero. A strategy you can use is to check if the divisor is zero:

This way, you can prevent the `ZeroDivisionError` by ensuring that the denominator is not zero before performing the division.

## 9\. FileNotFoundError

Python throws this exception when it attempts to perform file-related operations, such as reading, writing, or deleting a file that does not exist in the given location:

To fix this, ensure that the file exists at the given location. Also, double-check the file path, file extension, and take into account relative or absolute paths to the file.

Often, the program might receive incorrect file paths from users, which is beyond your control. A good solution is to use a `try-except` block to handle the `FileNotFoundError` so that the program doesn't crash:

This way, you can gracefully handle the absence of a file and prevent the program from crashing.

## 10\. ModuleNotFoundError

Python raises the `ModuleNotFoundError` when it can't import a module. This issue may arise if the module isn't installed on your system or in the virtual environment. Sometimes, the error could be due to an incorrect module path or name. Additionally, this error occurs when importing from a package that lacks a `__init__.py` file.

An example of this error's traceback is:

To resolve this, first check if the module is installed, using `pip` for third-party modules. Secondly, verify the accuracy of the module name and file path, as errors here can lead to this issue. Lastly, ensure that Python packages contain a `__init__.py` file, necessary for Python to recognize them as valid packages.

## 11\. MemoryError

A `MemoryError` in Python occurs when the system runs out of memory. This is often caused by memory leaks where memory is continuously consumed without being released, or by loading large files entirely instead of in smaller chunks.

For example, this code attempting to create a list with over a billion elements:

leads to a `MemoryError`:

To handle this, use memory profiling tools like Scalene to pinpoint the memory-intensive parts of your program.

For Python servers, an interim fix could be setting up an auto-restart mechanism that activates when memory usage crosses a certain limit. This approach can temporarily alleviate memory leaks by periodically freeing up memory.

For large file operations, read files in smaller chunks. If the file is line-based, iterate over discrete lines:

For single-line large files, consider using a Python generator. This method is detailed in [this Stack Overflow post](https://stackoverflow.com/questions/49752452/using-a-python-generator-to-process-large-text-files) on processing large text files.

## 12\. PermissionError

Python raises a `PermissionError` when it tries to execute an operation without the required privileges, such as accessing or modifying restricted files or directories. This error can also occur if a file is currently in use by another program.

For example, trying to create a directory in a protected area like `/etc`:

results in the following traceback:

To address a `PermissionError`, consider running your script with elevated privileges using sudo, but be cautious as it can be risky.

Other solutions include modifying file or directory permissions with `os.chmod()`, adjusting [ACLs](https://www.redhat.com/sysadmin/linux-access-control-lists) using `setfacl`, or moving the file/directory to a location with write permissions using `shutil.move()`. The right solution here depends on your specific needs and security considerations.

## 13\. IndexError

An `IndexError` is often encountered when you attempt to access an index in a sequence, such as a list, tuple, or string, and it is outside the valid range. For instance, trying to access index 4 in a list with only three elements:

results in the following exception:

To prevent IndexError, ensure that the index you're accessing falls within the sequence's valid range. This can be checked by comparing the index with the sequence's length, obtainable using the len() method.

## 14\. KeyError

A `KeyError` in Python is raised when an attempt is made to access a dictionary value using a key that doesn't exist. This error can occur if the key is missing, if there's a typographical error, or if the dictionary is empty:

The error message produced looks like this:

To avoid a `KeyError`, verify the presence of the key in the dictionary and ensure there are no typos. Alternatively, use the `dict.get()` method, which can return a default value if the key is not found:

For a more robust approach, use `get()` and handle the result accordingly:

## 15\. AttributeError

An AttributeError in Python is raised when there's an attempt to access or utilize an attribute that an object or class doesn't possess. For instance, since a list lacks the lower() method:

This attempt results in the following error message:

To prevent this error, ensure that you're using attributes and methods that are actually available for the given object. This can be confirmed by consulting the object's documentation. Additionally, verify the correct spelling of the attribute names.

You can also use tools like [Mypy](https://mypy-lang.org/) for static analysis to detect such issues early. Mypy would indicate a problem in the above code as follows:

While we've explored common Python errors and their solutions, it's important to recognize that errors are inevitable in any sufficiently complex programs. To effectively troubleshoot errors in a production environment, you should adopt a comprehensive logging strategy to understand the behavior of your application.

This practice is crucial for diagnosing issues after they occur. Python offers various [logging frameworks](https://betterstack.com/community/guides/logging/best-python-logging-libraries/) that can be seamlessly integrated into your application. Here's a basic example of setting up logging in Python:

**Learn more**: [A Comprehensive Guide to Logging in Python](https://betterstack.com/community/guides/logging/how-to-start-logging-with-python/)

Once you've started generating logs, [aggregating them into a central repository](https://betterstack.com/community/guides/logging/log-aggregation/) simplifies the debugging process by notifying you when such issues occur and providing an interface to search and visualize all your data.

![search-filter.png](https://imagedelivery.betterstackcdn.com/xZXo0QFi-1_4Zimer-T0XQ/9f262700-3623-4162-5a48-7cf7d7ccca00/orig)

[Better Stack](https://betterstack.com/logs) offers a powerful log management solution that not only stores logs but also provides advanced search, monitoring, and alerting capabilities to help you mitigate errors much faster.

![error-alert.png](https://imagedelivery.betterstackcdn.com/xZXo0QFi-1_4Zimer-T0XQ/e3452e17-6ec1-4baf-398d-22488a70ee00/orig)

[Sign up for a free account](https://uptime.betterstack.com/users/sign-up), and see how easy error monitoring can be.

## Final thoughts

Understanding the common causes of Python errors and how to address them is crucial for efficient problem-solving. In this article, we explored 15 common errors in Python and discussed various strategies to resolve them.

For further exploration,[the Python documentation](https://docs.python.org/3/tutorial/errors.html) offers detailed information on exceptions and custom exception creation.

You should also check out our [logging guides](https://betterstack.com/community/guides/logging/) for further guidance on how to create a comprehensive logging strategy for your Python applications.

Thanks for reading, and happy coding!

Got an article suggestion?[Let us know](https://betterstack.com/community/guides/scaling-python/python-errors/)

Next article

[

A Complete Guide to Gunicorn

Learn how to deploy and optimize Gunicorn for production with systemd and Nginx. This guide covers performance tuning, logging, security, and scaling strategies to make your Python web application fast, stable, and production-ready

→

](https://betterstack.com/community/guides/scaling-python/gunicorn-explained/)
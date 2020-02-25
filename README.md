# nest-global-modules

This repository is an example of a simple NEST application importing 2 global modules.

Currently this application doesn't launch because of a dependency error.

Here is the message thrown by Nest:

```
ExceptionHandler] Nest can't resolve dependencies of the LoggerProvider (?). Please make sure that the argument dependency at index [0] is available in the LoggerModule context.

Potential solutions:
- If dependency is a provider, is it part of the current LoggerModule?
- If dependency is exported from a separate @Module, is that module imported within LoggerModule?
  @Module({
    imports: [ /* the Module containing dependency */ ]
  })
```

## Expected behaviour

Since both the `Logger` and the `Config` modules are declared as `@Global()`, there shouldn't be a problem launching them.

## Side notes

This project has been generated using the Nest CLI. Here are the main tools version:

- "@nestjs/common": "^6.10.14" resolved to "6.11.8"
- "@nestjs/core": "^6.10.14" resolved to "6.11.8"
- "@nestjs/cli": "^6.13.2" resolved to "6.14.2"

export class FixtureNamedError extends Error {
  name = 'FixtureNamedError';
}

export class FixtureConstructorNamedError extends Error {
  name = this.constructor.name;
}

export class FixtureUnnamedError extends Error {}

export class FixtureSubclassError extends FixtureNamedError {
  name = 'FixtureSubclassError';
}

export class FixtureForgetfulSubclassError extends FixtureNamedError {}

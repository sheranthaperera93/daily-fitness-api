const objectId = (value, helpers) => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    return helpers.message('"{{#label}}" must be a valid mongo id');
  }
  return value;
};

const password = (value, helpers) => {
  if (!value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+.])[A-Za-z\d!@#$%^&*()_+.]{8,}$/)) {
    return helpers.message(
      'Password must contain at least 8 characters, 1 number, 1 uppercase & 1 lowercase letter and one of these special characters (!@#$%^&*()_+.)'
    );
  }
  return value;
};

module.exports = {
  objectId,
  password,
};

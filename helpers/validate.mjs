
export const validateUserParams = (username, password) => {
    if (!username || !password) {
        return 'Username and password are required';
    }

    if (username.length < 4 || username.length > 16) {
        return 'Username length must be between 4 and 16 characters';
    }

    if (password.length < 6 || password.length > 24) {
        return 'Password length must be between 6 and 24 characters';
    }

    return null;
}
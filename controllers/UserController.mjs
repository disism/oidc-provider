export class UserDatabase {
    constructor(database) {
        this.database = database;
    }

    async getUserByUsername(username) {
        try {
            const user = await this.database('users').where('username', username).first();
            return user || null;
        } catch (error) {
            console.error('Error retrieving authx:', error);
            throw error;
        }
    }

    async insertUser(user) {
        try {
            const existingUser = await this.database('users').select().where('username', user.username).first();
            if (existingUser) {
                console.log('Username already exists:', user.username);
                return 'USERNAME_ALREADY_EXISTS';
            }

            const result = await this.database('users').insert(user).returning('id');
            const insertedUserId = result[0];
            const insertedUser = { ...user, id: insertedUserId };
            console.log('User inserted:', insertedUser);
            return insertedUser;
        } catch (error) {
            console.error('Error inserting authx:', error);
            throw error;
        }
    }

    async updateUser(id, updates) {
        try {
            const result = await this.database('users').where({ id }).update(updates);
            console.log('User updated:', result);
        } catch (error) {
            console.error('Error updating authx:', error);
        }
    }

    async deleteUser(id) {
        try {
            const result = await this.database('users').where({ id }).del();
            console.log('User deleted:', result);
        } catch (error) {
            console.error('Error deleting authx:', error);
        }
    }
}
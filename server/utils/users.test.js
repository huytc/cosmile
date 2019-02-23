const expect = require('expect');

const {Users} = require('./users');

describe('Users', () => {
    let users;

    beforeEach(() => {
        users = new Users();
        users.users = [{
            id: '1',
            name: 'Huy',
            room: 'Family'
        }, {
            id: '2',
            name: 'Hien',
            room: 'Friends'
        }, {
            id: '3',
            name: 'Hao',
            room: 'Family'
        }];
    });

    it('should add new user', () => {
        let users = new Users();
        let user = {
            id: '123',
            name: 'Bong',
            room: 'My Class'
        };
        let resUser = users.addUser(user.id, user.name, user.room);

        expect(users.users).toEqual([user]);
    });

    it('should remove a user', () => {
        let userId = '1';
        let user = users.removeUser(userId);

        expect(user.id).toBe(userId);
        expect(users.users.length).toBe(2);
    });

    it('should not remove user', () => {
        let userId = '20';
        let user = users.removeUser(userId);

        expect(user).toBeUndefined();
        expect(users.users.length).toBe(3);
    });

    it('should find a user', () => {
        let userId = '2';
        let user = users.getUser(userId);

        expect(user.id).toBe(userId);
    });

    it('should not find user', () => {
        let userId = '99';
        let user = users.getUser(userId);

        expect(user).toBeUndefined();
    });

    it('should return names for Family', () => {
        let userList = users.getUserList('Family');

        expect(userList).toEqual(['Huy', 'Hao']);
    });

    it('should return names for Friends', () => {
        let userList = users.getUserList('Friends');

        expect(userList).toEqual(['Hien']);
    });
});
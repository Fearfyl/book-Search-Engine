import { AuthenticationError } from 'apollo-server-errors'; // Correct import for AuthenticationError
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

interface UserContext {
    _id: string;
    username: string;
    email: string;
}

interface Context {
    user?: UserContext;
}

interface BookData {
    authors: string[];
    description: string;
    bookId: string;
    image: string;
    link: string;
    title: string;
}

interface LoginArgs {
    email: string;
    password: string;
}

interface AddUserArgs {
    username: string;
    email: string;
    password: string;
}

interface SaveBookArgs {
    bookData: BookData;
}

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: Context) => {
            if (context.user) {
                return User.findById(context.user._id);
            }
            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
        login: async (_parent: any, { email, password }: LoginArgs) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }

            const token = signToken({
                username: user.username,
                email: user.email,
                _id: user._id.toString(),
            });
            return { token, user };
        },
        addUser: async (_parent: any, { username, email, password }: AddUserArgs) => {
            const user = await User.create({ username, email, password });
            const token = signToken({
                username: user.username,
                email: user.email,
                _id: user._id.toString(),
            });
            return { token, user };
        },
        saveBook: async (_parent: any, { bookData }: SaveBookArgs, context: Context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );

                return updatedUser;
            } catch (err) {
                console.error(err);
                throw new Error('Failed to save book');
            }
        },
    },
};

export default resolvers;
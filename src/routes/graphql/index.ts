import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
} from 'graphql/type';
import { CreatePostType, CreateProfileType, CreateUserType, MemberType, PostType, ProfileType, unsubscribeFromType, UpdateMemberType, UpdatePostType, UpdateProfileType, UpdateUserType, userSubscribedToType, UserType } from './types';
import { graphql } from 'graphql';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {

  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'RootQuery',
          fields: {
            // all
            users: {
              type: new GraphQLList(UserType),
              async resolve(parent, args) {
                return await fastify.db.users.findMany();
              }
            },
            posts: {
              type: new GraphQLList(PostType),
              async resolve(parent, args) {
                return await fastify.db.posts.findMany();
              }
            },
            profiles: {
              type: new GraphQLList(ProfileType),
              async resolve(parent, args) {
                return await fastify.db.profiles.findMany();
              }
            },
            memberTypes: {
              type: new GraphQLList(MemberType),
              async resolve(parent, args) {
                return fastify.db.memberTypes.findMany();
              }
            },
            // id
            user: {
              type: UserType,
              args: { id: { type: new GraphQLNonNull(GraphQLID) } },
              async resolve(parent, args) {
                const user = await fastify.db.users.findOne({key:'id', equals: args.id});          
                if( !user) {
                  throw fastify.httpErrors.notFound("User not found!");
                }        
                return user;
              }
            },
            post: {
              type: PostType,
              args: { id: { type: new GraphQLNonNull(GraphQLID) } },
              async resolve(parent, args) {
                const post = await fastify.db.posts.findOne({key:'id', equals: args.id});
                if (!post) {
                  throw fastify.httpErrors.notFound("Post not Found!");
                }              
                return post;
              }
            },
            profile: {
              type: ProfileType,
              args: { id: { type: new GraphQLNonNull(GraphQLID) } },
              async resolve(parent, args) {
                const profile = await fastify.db.profiles.findOne({key:'id', equals: args.id});
                if (!profile) {
                  throw fastify.httpErrors.notFound('Profile not found');
                }
                return profile;
              }
            },
            memberType: {
              type: MemberType,
              args: { id: { type: new GraphQLNonNull(GraphQLID) } },
              async resolve(parent, args) {
                const memberType = await fastify.db.memberTypes.findOne({key:'id', equals: args.id});
                  if (!memberType) {
                    throw fastify.httpErrors.notFound("Member type not found");
                  }
                  return memberType;                  
              }
            },          
          }
        }),
        mutation: new GraphQLObjectType({
          name: 'RootMutation',
          fields: {
            createUser: {
              type: UserType,
              args:{ user: {type: new GraphQLNonNull(CreateUserType) } },
              async resolve(parent, args) {                             
                return await fastify.db.users.create(args.user);
              }
            },
            createProfile: {
              type: ProfileType,
              args: { profile: { type: new GraphQLNonNull(CreateProfileType)} },
              async resolve(parent, args) {
                if (await fastify.db.profiles.findOne({key:'userId', equals: args.profile.userId})) {
                  throw fastify.httpErrors.badRequest("Profile has already exist!");
                }
          
                if (!(await fastify.db.memberTypes.findOne({ key: 'id', equals: args.profile.memberTypeId }))) {
                  throw fastify.httpErrors.badRequest('Member Type does not exists');
                }
                return await fastify.db.profiles.create(args.profile);
              }
            },
            createPost: {
              type: PostType,
              args: { post: { type: new GraphQLNonNull(CreatePostType) } },
              async resolve(parent, args) {
                return await fastify.db.posts.create(args.post);             
              }
            },
            updateUser:{
              type: UserType,
              args: { user: { type: new GraphQLNonNull(UpdateUserType) } },
              async resolve(parent, args) {                             
                try {
                  const { id, ...body } = args.user;
                  return await fastify.db.users.change(id, body);
                } catch (err) {
                  throw fastify.httpErrors.badRequest("Bad request!");
                }
              }
            },
            updateProfile: {
              type: ProfileType,
              args: { profile: { type: new GraphQLNonNull(UpdateProfileType) } },
              async resolve(parent, args) {                             
                try {
                  const { id, ...body } = args.profile;
                  return await fastify.db.profiles.change(id, body);
                } catch (err) {
                  throw fastify.httpErrors.badRequest("Bad request!");
                }
              }
            },
            updatePost: {
              type: PostType,
              args: { post: { type: new GraphQLNonNull(UpdatePostType) }              },
              async resolve(parent, args) {
                try {
                  const { id, ...body } = args.post;
                  return await fastify.db.posts.change(id, body);
                } catch (err) {
                  throw fastify.httpErrors.badRequest("Bad request!");
                }
              }
            },
            updateMember: {
              type: MemberType,
              args: {member: { type: new GraphQLNonNull(UpdateMemberType)}},
              async resolve(parent, args) {
                try {
                  const { id, ...body } = args.member;
                  return await fastify.db.memberTypes.change(id, body);
                } catch (err) {
                  throw fastify.httpErrors.badRequest("Bad request!");
                }
              }
            },
            userSubscribedTo: {
              type: UserType,
              args: { subscriber: { type: userSubscribedToType }},
              async resolve(parent, args) {
                const { userId, subscriberId } = args.subscriber;
                const users = await fastify.db.users.findMany({key: 'id', equalsAnyOf: [userId, subscriberId]});
                const user = users.find((user) => user.id === userId);
                const subscriber = users.find((user) => user.id === subscriberId);
                if (!user || !subscriber) {
                  throw fastify.httpErrors.notFound("User or subscriber not found!")
                }
                subscriber.subscribedToUserIds.push(user.id);
                return fastify.db.users.change(subscriber.id, {subscribedToUserIds: subscriber.subscribedToUserIds});
                // const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
                // const subscriber = await fastify.db.users.findOne({ key: 'id', equals: subscriberId });
                // if (!user || !subscriber) {
                //   throw fastify.httpErrors.notFound("User or subscriber not found!");
                // }
                // try {
                //   await fastify.db.users.change(user.id, {
                //     subscribedToUserIds: [...user.subscribedToUserIds, subscriber.id]
                //   })
                //   return user;
                // } catch (error) {
                //   throw fastify.httpErrors.badRequest("Bad request!");
                // }
              }
            },
            unsubscribeFromUser: {
              type: UserType,
              args: { subscriber: { type: unsubscribeFromType }},
              async resolve(parent, args) {
                const { userId, unsubscriberId } = args.subscriber;
                // const users = await fastify.db.users.findMany({key: 'id', equalsAnyOf: [userId, unsubscriberId]});
                // const user = users.find((user) => user.id === userId);
                // const unsubscriber = users.find((user) => user.id === unsubscriberId);
                const user = await fastify.db.users.findOne({ key: 'id', equals: userId});
                const unsubscriber = await fastify.db.users.findOne({ key: 'id', equals: unsubscriberId})

                if (!user || !unsubscriber) {
                  throw fastify.httpErrors.notFound("User or subscriber not found!")
                }
                const subscriberIndex = unsubscriber.subscribedToUserIds.findIndex((id) => id === user.id);
                if (subscriberIndex === -1) {
                  throw fastify.httpErrors.notFound("Subscriber not found!")
                };
                unsubscriber.subscribedToUserIds.splice(subscriberIndex, 1);
                return fastify.db.users.change(unsubscriber.id, {subscribedToUserIds: unsubscriber.subscribedToUserIds});
              }
            }
          }
        })
      }) 
    
      const query = request.body.query as string;
      return await graphql({ 
        schema, 
        source: query,
        variableValues: request.body.variables, 
        contextValue: fastify
       });
    }
  );
};

export default plugin;

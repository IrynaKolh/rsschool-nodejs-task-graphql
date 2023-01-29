import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLSchema,
} from 'graphql/type';
import { CreateUserType, MemberType, PostType, ProfileType, UserType } from './types';
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
              args:{ user: {type: CreateUserType}  },
              async resolve(parent, args) {                             
                return await fastify.db.users.create(args.user);
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

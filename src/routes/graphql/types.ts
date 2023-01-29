import {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';


export const MemberType = new GraphQLObjectType({
  name: 'Member',
  fields: () => ({
    id: { type: GraphQLID },
    discount: { type: new GraphQLNonNull(GraphQLInt) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) }
  })
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },   
  })
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: GraphQLID },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
  })
});

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    profile: { 
      type: ProfileType,
     async resolve(parent, args, fastify){
      const profile = await fastify.db.profiles.findOne({key:'userId', equals: parent.id});
      if (!profile) {
        throw fastify.httpErrors.notFound('Profile not found');
      }
      return profile;
     }
    },
    posts: { 
      type: new GraphQLList(PostType),
      async resolve(parent, args, fastify){
        const posts = await fastify.db.posts.findMany({key:'userId', equals: parent.id});
        if (!posts) {
          throw fastify.httpErrors.notFound('Posts not found');
        }
        return posts;
       }
    },
    memberType: { 
      type: MemberType,
      async resolve(parent, args, fastify){
        const profile = await fastify.db.profiles.findOne({key:'userId', equals: parent.id});
        if (profile === null) {
          throw fastify.httpErrors.notFound("User can't have member type without profile!");
        }
        return fastify.db.memberTypes.findOne({
          key: "id",
          equals: profile.memberTypeId,
        });
       }
    },
    subscribedToUserIds: { type: new GraphQLList(GraphQLID) },
  })
});
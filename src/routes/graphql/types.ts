import {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql';

//  QUERY TYPES TASKS 2.1-2.7

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
    memberTypeId: { type: new GraphQLNonNull(GraphQLID) },
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
    // userSubscribedTo: {
    //   type: new GraphQLList(GraphQLID),
    //   async resolve(parent, args, fastify) {
    //     return fastify.db.users.findMany({key: 'id', equals: parent.subscribedToUserIds});        
    //   }
    // },
    // subscribedToUser: {
    //   type: new GraphQLList(GraphQLID),
    //   async resolve(parent, args, fastify) {
    //     return fastify.db.users.findMany({key: 'subscribedToUserIds', inArray: parent.id });     
    //   }
    // }
  })
});

// CREATE TYPES TASKS 2.8-2.11

export const CreateUserType = new GraphQLInputObjectType({
  name: 'CreateUserType',
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) }
  })
});

export const CreateProfileType = new GraphQLInputObjectType({
  name: 'CreateProfileType',
  fields: () => ({
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLID) },
  })
});

export const CreatePostType = new GraphQLInputObjectType({
  name: 'CreatePostType',
  fields: () => ({
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },  
  })
});

// UPDATE TYPES TASKS 2.12-2.17

export const UpdateUserType = new GraphQLInputObjectType({
  name: 'UpdateUserType',
  fields: () => ({
      id: { type: new GraphQLNonNull(GraphQLID) },
      firstName: { type: GraphQLString },
      lastName: { type: GraphQLString },
      email: { type: GraphQLString }
  }),
});

export const UpdateProfileType = new GraphQLInputObjectType({
  name: 'UpdateProfileType',
  fields: () => ({    
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLID },
    userId: { type: GraphQLString }
  })
});

export const UpdatePostType = new GraphQLInputObjectType({
  name: 'UpdatePostType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) }      
  })
});

export const UpdateMemberType = new GraphQLInputObjectType({
  name: 'UpdateMemberType',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    discount: { type:  new GraphQLNonNull(GraphQLInt) },
    monthPostsLimit: { type:  new GraphQLNonNull(GraphQLInt) }
  })
});
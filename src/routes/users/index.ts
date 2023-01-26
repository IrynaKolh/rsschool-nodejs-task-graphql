import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';
import validator from 'validator';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {
   return fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
       const user = await fastify.db.users.findOne({key:'id', equals: request.params.id});    
      
      if( !user) {
        throw fastify.httpErrors.notFound("User not found!");
      }

      if (!validator.isUUID(request.params.id)) {
        throw fastify.httpErrors.badRequest("Incorrect user id!");        
      }

      return user;
    }
    
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      return await fastify.db.users.create(request.body);
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: request.params.id});  
      if(profile) {
        await fastify.db.profiles.delete(profile.id);
      }

      const posts = await fastify.db.posts.findMany({ key: 'userId', equals: request.params.id });
      if (posts) {
        posts.forEach(async (post) => {
          await fastify.db.posts.delete(post.id);
        });
      }

      const subscribers = await fastify.db.users.findMany({ key: "subscribedToUserIds", inArray: request.params.id })
       if (subscribers) {
        subscribers.forEach((subscriber) => {
          const subscriberIndex = subscriber.subscribedToUserIds.findIndex((id) => id === request.params.id);
            if (subscriberIndex === -1) {
            reply.statusCode = 404;
            throw new Error("Not found!");
            };
          subscriber.subscribedToUserIds.splice(subscriberIndex, 1);
          fastify.db.users.change(subscriber.id, {subscribedToUserIds: subscriber.subscribedToUserIds})
        });
       }

       try {
        return await fastify.db.users.delete(request.params.id);
      } catch (error) {
        reply.statusCode = 400;        
        throw new Error('User not found');
      }
    
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
     const users = await fastify.db.users.findMany({key: 'id', equalsAnyOf: [request.params.id, request.body.userId]});

     const user = users.find((user) => user.id === request.params.id);
     const subscriber = users.find((user) => user.id === request.body.userId);

     if (!user || !subscriber) {
      reply.statusCode = 400;
      throw new Error("Not found!");
     }
     subscriber.subscribedToUserIds.push(user.id);
     return fastify.db.users.change(subscriber.id, {subscribedToUserIds: subscriber.subscribedToUserIds});
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const users = await fastify.db.users.findMany({key: 'id', equalsAnyOf: [request.params.id, request.body.userId]});

     const user = users.find((user) => user.id === request.params.id);
     const subscriber = users.find((user) => user.id === request.body.userId);
      
     if (!user || !subscriber) {
      reply.statusCode = 404;
      throw new Error("Not found!");
     }

     const subscriberIndex = subscriber.subscribedToUserIds.findIndex((id) => id === user.id);
     if (subscriberIndex === -1) {
      reply.statusCode = 400;
      throw new Error("Not found!");
     };
     subscriber.subscribedToUserIds.splice(subscriberIndex, 1);

      return fastify.db.users.change(subscriber.id, {subscribedToUserIds: subscriber.subscribedToUserIds});
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const id = request.params.id;         
      if (!validator.isUUID(id)) {
        reply.statusCode = 400;
        throw new Error("Incorrect user id!");        
      }
      const user = await fastify.db.users.change(id, request.body);
      return user;
    }
  );
};

export default plugin;

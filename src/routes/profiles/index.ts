import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return await fastify.db.profiles.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({key:'id', equals: request.params.id});
      if (!profile) {
        throw fastify.httpErrors.notFound('Profile not found');
      }
      return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      // const user = await fastify.db.users.findOne({ key: "id", equals: request.body.userId });
      // if (!user) {
      //   reply.statusCode = 404;
      //   throw new Error("Bad request!");
      // }
      
      if (await fastify.db.profiles.findOne({key:'userId', equals: request.body.userId})) {
        throw fastify.httpErrors.badRequest("Profile has already exist!");
      }

      if (!(await fastify.db.memberTypes.findOne({ key: 'id', equals: request.body.memberTypeId }))) {
        throw fastify.httpErrors.badRequest('Member Type does not exists');
      }
      return fastify.db.profiles.create(request.body);
      
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({key:'id',equals: request.params.id});
      if (!profile) {
        reply.statusCode = 400;
        throw new Error("Not found!");
      }

      return await fastify.db.profiles.delete(profile.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({key:'id', equals: request.params.id});
      if (!profile) {
        reply.statusCode = 400;
        throw new Error("Not found!");
      } else {
        return fastify.db.profiles.change(profile.id, request.body);
      }      
    }
  );
};

export default plugin;

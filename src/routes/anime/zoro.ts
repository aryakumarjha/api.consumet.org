import { FastifyRequest, FastifyReply, FastifyInstance, RegisterOptions } from 'fastify';
import { ANIME } from '@consumet/extensions';
import { StreamingServers, SubOrSub } from '@consumet/extensions/dist/models';
import { redis } from '../../main'; // Import redis instance

const routes = async (fastify: FastifyInstance, options: RegisterOptions) => {
  const zoro = new ANIME.Zoro(process.env.ZORO_URL);
  let baseUrl = 'https://hianime.to';
  if (process.env.ZORO_URL) {
    baseUrl = `https://${process.env.ZORO_URL}`;
  }

  fastify.get('/', (_, rp) => {
    rp.status(200).send({
      intro: `Welcome to the zoro provider: check out the provider's website @ ${baseUrl}`,
      routes: [
        '/:query',
        '/recent-episodes',
        '/top-airing',
        '/most-popular',
        '/most-favorite',
        '/latest-completed',
        '/recent-added',
        '/info?id',
        '/watch/:episodeId',
        '/genre/list',
        '/genre/:genre',
        '/movies',
        '/ona',
        '/ova',
        '/specials',
        '/tv',
      ],
      documentation: 'https://docs.consumet.org/#tag/zoro',
    });
  });

  fastify.get('/:query', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = (request.params as { query: string }).query;
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1 if not provided

    const cacheKey = `zoro:search:${query}:${page}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }

      const res = await zoro.search(query, page);

      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 3600); // Cache for 1 hour
      }

      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching search results.' });
    }
  });

  fastify.get(
    '/recent-episodes',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const page = (request.query as { page: number }).page ?? 1; // Default page to 1
      const cacheKey = `zoro:recent:${page}`;

      try {
        if (redis) {
          const cached = await redis.get(cacheKey);
          if (cached) {
            return reply.status(200).send(JSON.parse(cached));
          }
        }
        const res = await zoro.fetchRecentlyUpdated(page);
        if (redis) {
          await redis.set(cacheKey, JSON.stringify(res), 'EX', 1800); // Cache for 30 minutes
        }
        reply.status(200).send(res);
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ message: 'Error fetching recent episodes.' });
      }
    },
  );

  fastify.get('/top-airing', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:top-airing:${page}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchTopAiring(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching top airing anime.' });
    }
  });

  fastify.get('/most-popular', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:most-popular:${page}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchMostPopular(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching most popular anime.' });
    }
  });

  fastify.get('/most-favorite', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:most-favorite:${page}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchMostFavorite(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching most favorite anime.' });
    }
  });

  fastify.get(
    '/latest-completed',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const page = (request.query as { page: number }).page ?? 1; // Default page to 1
      const cacheKey = `zoro:latest-completed:${page}`;

      try {
        if (redis) {
          const cached = await redis.get(cacheKey);
          if (cached) {
            return reply.status(200).send(JSON.parse(cached));
          }
        }
        const res = await zoro.fetchLatestCompleted(page);
        if (redis) {
          await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
        }
        reply.status(200).send(res);
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ message: 'Error fetching latest completed anime.' });
      }
    },
  );

  fastify.get('/recent-added', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:recent-added:${page}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchRecentlyAdded(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching recently added anime.' });
    }
  });

  fastify.get('/top-upcoming', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:top-upcoming:${page}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchTopUpcoming(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 86400); // Cache for 24 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching top upcoming anime.' });
    }
  });

  fastify.get('/schedule/:date', async (request: FastifyRequest, reply: FastifyReply) => {
    const date = (request.params as { date: string }).date;
    const cacheKey = `zoro:schedule:${date}`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchSchedule(date);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 86400); // Cache for 24 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching schedule.' });
    }
  });

  fastify.get(
    '/studio/:studioId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const studioId = (request.params as { studioId: string }).studioId;
      const page = (request.query as { page: number }).page ?? 1;
      const cacheKey = `zoro:studio:${studioId}:${page}`;

      try {
        if (redis) {
          const cached = await redis.get(cacheKey);
          if (cached) {
            return reply.status(200).send(JSON.parse(cached));
          }
        }
        const res = await zoro.fetchStudio(studioId, page);
        if (redis) {
          await redis.set(cacheKey, JSON.stringify(res), 'EX', 86400); // Cache for 24 hours
        }
        reply.status(200).send(res);
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ message: 'Error fetching studio data.' });
      }
    },
  );

  fastify.get('/spotlight', async (request: FastifyRequest, reply: FastifyReply) => {
    const cacheKey = `zoro:spotlight`;

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchSpotlight();
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ message: 'Error fetching spotlight data.' });
    }
  });

  fastify.get(
    '/search-suggestions/:query',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const query = (request.params as { query: string }).query;
      const cacheKey = `zoro:suggestions:${query}`;

      try {
        if (redis) {
          const cached = await redis.get(cacheKey);
          if (cached) {
            return reply.status(200).send(JSON.parse(cached));
          }
        }
        const res = await zoro.fetchSearchSuggestions(query);
        if (redis) {
          await redis.set(cacheKey, JSON.stringify(res), 'EX', 3600); // Cache for 1 hour
        }
        reply.status(200).send(res);
      } catch (err) {
        fastify.log.error(err);
        reply.status(500).send({ message: 'Error fetching search suggestions.' });
      }
    },
  );

  fastify.get('/info', async (request: FastifyRequest, reply: FastifyReply) => {
    const id = (request.query as { id: string }).id;
    const cacheKey = `zoro:info:${id}`;

    if (typeof id === 'undefined')
      return reply.status(400).send({ message: 'id is required' });

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }

      const res = await zoro.fetchAnimeInfo(id);

      if (redis) {
        // Cache anime info for a longer duration, e.g., 1 day
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 86400);
      }
      return reply.status(200).send(res);
    } catch (err: any) {
      // Check if the error indicates not found, otherwise log and return 500
      if (
        err?.message?.includes('404') ||
        err?.message?.toLowerCase().includes('not found')
      ) {
        return reply.status(404).send({ message: `Anime with id ${id} not found.` });
      }
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message:
            'Something went wrong fetching anime info. Contact developer for help.',
        });
    }
  });

  const watch = async (request: FastifyRequest, reply: FastifyReply) => {
    let episodeId = (request.params as { episodeId: string }).episodeId;
    if (!episodeId) {
      episodeId = (request.query as { episodeId: string }).episodeId;
    }

    const server = (request.query as { server?: StreamingServers }).server;
    let dub = (request.query as { dub?: string | boolean }).dub;
    if (dub === 'true' || dub === '1') dub = true;
    else dub = false;

    const subOrDub = dub === true ? SubOrSub.DUB : SubOrSub.SUB;
    const cacheKey = `zoro:watch:${episodeId}:${server || 'default'}:${subOrDub}`;

    if (server && !Object.values(StreamingServers).includes(server))
      return reply.status(400).send({ message: 'server is invalid' });

    if (typeof episodeId === 'undefined')
      return reply.status(400).send({ message: 'episodeId is required' });

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }

      const res = await zoro.fetchEpisodeSources(episodeId, server, subOrDub);

      if (redis) {
        // Cache watch links for a shorter duration, e.g., 15 minutes
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 900);
      }

      reply.status(200).send(res);
    } catch (err: any) {
      if (
        err?.message?.includes('404') ||
        err?.message?.toLowerCase().includes('not found')
      ) {
        return reply
          .status(404)
          .send({
            message: `Episode with id ${episodeId} not found or sources unavailable.`,
          });
      }
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message:
            'Something went wrong fetching episode sources. Contact developer for help.',
        });
    }
  };
  fastify.get('/watch', watch);
  fastify.get('/watch/:episodeId', watch);

  fastify.get('/genre/list', async (_, reply) => {
    const cacheKey = 'zoro:genres';
    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchGenres();
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 86400); // Cache genres for 1 day
      }
      reply.status(200).send(res);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        message: 'Something went wrong fetching genres. Contact developer for help.',
      });
    }
  });

  fastify.get('/genre/:genre', async (request: FastifyRequest, reply: FastifyReply) => {
    const genre = (request.params as { genre: string }).genre;
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:genre:${genre}:${page}`;

    if (typeof genre === 'undefined')
      return reply.status(400).send({ message: 'genre is required' });

    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.genreSearch(genre, page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 3600); // Cache for 1 hour
      }
      reply.status(200).send(res);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({
        message: 'Something went wrong searching by genre. Contact developer for help.',
      });
    }
  });

  fastify.get('/movies', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:movies:${page}`;
    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchMovie(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message: 'Something went wrong fetching movies. Contact developer for help.',
        });
    }
  });

  fastify.get('/ona', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:ona:${page}`;
    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchONA(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message: 'Something went wrong fetching ONAs. Contact developer for help.',
        });
    }
  });

  fastify.get('/ova', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:ova:${page}`;
    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchOVA(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message: 'Something went wrong fetching OVAs. Contact developer for help.',
        });
    }
  });

  fastify.get('/specials', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:specials:${page}`;
    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchSpecial(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message: 'Something went wrong fetching specials. Contact developer for help.',
        });
    }
  });

  fastify.get('/tv', async (request: FastifyRequest, reply: FastifyReply) => {
    const page = (request.query as { page: number }).page ?? 1; // Default page to 1
    const cacheKey = `zoro:tv:${page}`;
    try {
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return reply.status(200).send(JSON.parse(cached));
        }
      }
      const res = await zoro.fetchTV(page);
      if (redis) {
        await redis.set(cacheKey, JSON.stringify(res), 'EX', 21600); // Cache for 6 hours
      }
      reply.status(200).send(res);
    } catch (err) {
      fastify.log.error(err);
      reply
        .status(500)
        .send({
          message: 'Something went wrong fetching TV shows. Contact developer for help.',
        });
    }
  });
};

export default routes;

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModerationService } from '../moderation/moderation.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './post.entity';

interface PaginatedPosts {
  posts: Post[];
  total: number;
  page: number;
  pages: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    private readonly moderation: ModerationService,
  ) {}

  async create(authorId: string, dto: CreatePostDto): Promise<Post> {
    const post = this.postRepo.create({ authorId, body: dto.body });
    const saved = await this.postRepo.save(post);

    const result = this.moderation.fastCheck({
      contentId: saved.id,
      contentType: 'post',
      contentText: dto.body,
      authorId,
    });

    if (result.verdict === 'REMOVE') {
      saved.status = 'removed';
      return this.postRepo.save(saved);
    }

    if (result.verdict === 'HUMAN_REVIEW') {
      saved.status = 'review';
      return this.postRepo.save(saved);
    }

    return saved;
  }

  async findFeed(opts: { page?: number; limit?: number }): Promise<PaginatedPosts> {
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts.limit ?? 20));
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepo
      .createQueryBuilder('post')
      .where('post.status = :status', { status: 'active' })
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { posts, total, page, pages: Math.ceil(total / limit) };
  }

  async findByAuthor(
    authorId: string,
    page?: number,
    limit?: number,
  ): Promise<PaginatedPosts> {
    const resolvedPage = Math.max(1, page ?? 1);
    const resolvedLimit = Math.min(50, Math.max(1, limit ?? 20));
    const skip = (resolvedPage - 1) * resolvedLimit;

    const [posts, total] = await this.postRepo
      .createQueryBuilder('post')
      .where('post.authorId = :authorId', { authorId })
      .andWhere('post.status = :status', { status: 'active' })
      .orderBy('post.createdAt', 'DESC')
      .skip(skip)
      .take(resolvedLimit)
      .getManyAndCount();

    return {
      posts,
      total,
      page: resolvedPage,
      pages: Math.ceil(total / resolvedLimit),
    };
  }

  async remove(id: string, requesterId: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    if (post.authorId !== requesterId) {
      throw new ForbiddenException('You may only delete your own posts');
    }
    post.status = 'removed';
    await this.postRepo.save(post);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.postRepo
      .createQueryBuilder()
      .update(Post)
      .set({ likeCount: () => '"likeCount" + 1' })
      .where('id = :id', { id })
      .execute();
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
import * as cron from 'node-cron';
import Redis from 'ioredis';
import * as cronParser from 'cron-parser';

@Injectable()
export class JobService {
  private scheduledJobs: Map<number, cron.ScheduledTask> = new Map();

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @Inject('REDIS_CLIENT')
    private redisClient: Redis,
  ) {}

  async create(createJobDto: CreateJobDto): Promise<Job> {
    const job = this.jobRepository.create({
      ...createJobDto,
      lastRun: new Date(),
      nextRun: this.calculateNextRun(createJobDto.cronExpression),
    });
    const savedJob = await this.jobRepository.save(job);
    this.scheduleJob(savedJob);
    await this.redisClient.del('jobs'); // Invalidate cache
    return savedJob;
  }

  async findAll(): Promise<Job[]> {
    const cachedJobs = await this.redisClient.get('jobs');
    if (cachedJobs) {
      return JSON.parse(cachedJobs);
    }
    const jobs = await this.jobRepository.find();
    await this.redisClient.set('jobs', JSON.stringify(jobs));
    return jobs;
  }

  async findOne(id: number): Promise<Job> {
    const cachedJob = await this.redisClient.get(`job:${id}`);
    if (cachedJob) {
      return JSON.parse(cachedJob);
    }
    const job = await this.jobRepository.findOne({ where: { id } });
    await this.redisClient.set(`job:${id}`, JSON.stringify(job));
    return job;
  }

  async update(id: number, updateJobDto: UpdateJobDto): Promise<Job> {
    await this.jobRepository.update(id, updateJobDto);
    const updatedJob = await this.jobRepository.findOne({ where: { id } });
    this.scheduleJob(updatedJob);
    await this.redisClient.del('jobs'); // Invalidate cache
    await this.redisClient.set(`job:${id}`, JSON.stringify(updatedJob));
    return updatedJob;
  }

  async remove(id: number): Promise<void> {
    await this.jobRepository.delete(id);
    const scheduledJob = this.scheduledJobs.get(id);
    if (scheduledJob) {
      scheduledJob.stop();
      this.scheduledJobs.delete(id);
    }
    await this.redisClient.del('jobs'); // Invalidate cache
    await this.redisClient.del(`job:${id}`);
  }

  private scheduleJob(job: Job) {
    const scheduledJob = this.scheduledJobs.get(job.id);
    if (scheduledJob) {
      scheduledJob.stop();
    }

    const newScheduledJob = cron.schedule(job.cronExpression, () => {
      console.log(`Running job: ${job.name}`);
      job.lastRun = new Date();
      job.nextRun = this.calculateNextRun(job.cronExpression);
      this.jobRepository.save(job);
    });

    this.scheduledJobs.set(job.id, newScheduledJob);
  }

  private calculateNextRun(cronExpression: string): Date {
    const interval = cronParser.parseExpression(cronExpression);
    return interval.next().toDate();
  }
}

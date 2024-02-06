"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "@/lib/database";
import {
  CreateEventParams,
  UpdateEventParams,
  DeleteEventParams,
  GetAllEventsParams,
  GetEventsByUserParams,
  GetRelatedEventsByCategoryParams,
} from '@/types'
import User from "../database/models/user.model";
import Event from "../database/models/event.model";
import Category from '@/lib/database/models/category.model'
import { revalidatePath } from "next/cache";


const populateEvent = (query: any) => {
  return query
    .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
    .populate({ path: 'category', model: Category, select: '_id name' })
}

export const createEvent = async ({
  event,
  userId,
  path,
}: CreateEventParams) => {
  try {
    await connectToDatabase();
    const organizer = await User.findById(userId);
    if (!organizer) {
      throw new Error("organizer not found");
    }
    const newEvent = await Event.create({
      ...event,
      category: event.categoryId,
      organizer: userId,
    });
    return JSON.parse(JSON.stringify(newEvent))

  } catch (err) {
    handleError(err);
  }
};

export const getEventById = async (eventId : string) =>{
  try {
    await connectToDatabase();
    const event = await populateEvent(Event.findById(eventId))

    if (!event) throw new Error('Event not found')

    return JSON.parse(JSON.stringify(event))
  }
  catch (err) {
    handleError(err);
  }
}

export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    // const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    // const categoryCondition = category ? await getCategoryByName(category) : null
    // const conditions = {
    //   $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    // }

    // const skipAmount = (Number(page) - 1) * limit
    const conditions = {}
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(0)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

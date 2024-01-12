"use server";

import { handleError } from "../utils";
import { connectToDatabase } from "@/lib/database";
import { CreateEventParams } from "@/types";
import User from "../database/models/user.model";
import Event from "../database/models/event.model";
import Category from '@/lib/database/models/category.model'


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

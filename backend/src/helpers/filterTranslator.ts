import { Statement } from './clauses';
import { Types } from 'mongoose';

export interface MongoFilter {
  fields?: Array<any>;
  where?: any;
  order?: any;
  limit?: number;
  skip?: number;
}

export const filterTranslator = (filter: Statement) => {
  const newFilter: MongoFilter = {
    fields: undefined,
    where: undefined,
    order: undefined,
    limit: filter?.limit ? filter?.limit : undefined,
    skip: filter?.skip ? filter?.skip : undefined,
  };

  if (!filter) {
    return newFilter;
  }

  if (filter.fields) {
    newFilter.fields = [];
    for (const key in filter.fields) {
      if (filter.fields[key] === true) {
        newFilter.fields.push(key);
      }
    }
  }

  if (filter.where) {
    newFilter.where = {};

    for (const key in filter.where) {
      if (filter.where[key] instanceof Types.ObjectId) {
        newFilter.where[key] = filter.where[key];
      } else if (key === 'or') {
        newFilter.where.$or = filter.where.or;
      } else if (key === 'and') {
        newFilter.where.$and = filter.where.and;
      } else if (typeof filter.where[key] === 'object') {
        if (filter.where[key].hasOwnProperty('like')) {
          newFilter.where[key] = new RegExp((filter.where[key] as any)['like']);
        } else if (filter.where[key].hasOwnProperty('ilike')) {
          newFilter.where[key] = new RegExp(
            (filter.where[key] as any)['ilike'],
            'i',
          );
        } else {
          newFilter.where[key] = filter.where[key];
        }
      } else {
        newFilter.where[key] = filter.where[key];
      }
    }
  }

  if (filter.order) {
    if (typeof filter.order === 'object') {
      for (const key in filter.order) {
        if (!newFilter.order) {
          newFilter.order = {};
        }
        if (filter.order) {
          newFilter.order[key] = filter.order[key];
        }
      }
    } else {
      const nameRegex = /^[\S]+/;
      const sort = nameRegex.exec(filter.order);
      if (sort && sort[0]) {
        const sortName = sort[0];
        const sortOrderRegEx = /(ASC|DESC)$/i;
        const sortOrder = sortOrderRegEx.exec(filter.order);
        if (sortOrder && sortOrder[0]) {
          newFilter.order = {};
          newFilter.order[sortName] =
            `${sortOrder[0]}`.toUpperCase() === 'ASC' ? 1 : -1;
        } else {
          newFilter.order = {};
          newFilter.order[sortName] = 1;
        }
      }
    }
  }

  return newFilter;
};

export const prepareAggregateArray = (
  restrictionObject?: any,
  filter?: MongoFilter,
) => {
  const array = [];

  if (filter?.where) {
    array.push({
      $match: filter.where,
    });
  }

  if (restrictionObject) {
    array.push({
      $match: restrictionObject,
    });
  }

  if (filter?.order) {
    array.push({
      $sort: filter.order,
    });
  }

  if (filter?.fields) {
    const $project = {};
    filter.fields.forEach((el) => {
      $project[el] = true;
    });
    array.push({
      $project: $project,
    });
  }

  if (filter.skip) {
    array.push({
      $skip: filter.skip,
    });
  }

  if (filter.limit) {
    array.push({
      $limit: filter.limit,
    });
  }

  return array;
};

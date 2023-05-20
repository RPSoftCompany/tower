export interface WhereClause {
  or?: Array<StringPair>;
  and?: Array<StringPair>;

  [x: string]: unknown;
}

export interface StatementField {
  [x: string]: boolean;
}

export interface StringPair {
  [x: string]: string;
}

export interface Statement {
  where?: WhereClause;
  order?: string;
  skip?: number;
  limit?: number;
  fields?: StatementField;
}

export interface BaseModelStatement {
  [x: string]: string;
}

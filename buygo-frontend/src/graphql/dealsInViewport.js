import { gql } from '@apollo/client';

export const DEALS_IN_VIEWPORT_QUERY = gql`
  query DealsInViewport($boundingBox: BoundingBox!) {
    dealsInViewport(boundingBox: $boundingBox) {
      id
      title
      location {
        latitude
        longitude
      }
    }
  }
`;

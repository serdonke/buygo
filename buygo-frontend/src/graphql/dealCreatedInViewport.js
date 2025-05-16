import { gql } from '@apollo/client';

export const DEAL_CREATED_SUBSCRIPTION = gql`
  subscription DealCreatedInViewport($boundingBox: BoundingBox!) {
    dealCreatedInViewport(boundingBox: $boundingBox) {
      id
      title
      location {
        latitude
        longitude
      }
    }
  }
`;

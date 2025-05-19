import { gql } from '@apollo/client';

export const CREATE_DEAL_MUTATION = gql`
  mutation CreateDeal($input: DealInput!) {
    createDeal(input: $input) {
      id
      title
      location {
        latitude
        longitude
      }
    }
  }
`;

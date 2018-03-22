import gql from 'graphql-tag';
import { Sheriff } from '../api/Api';
import { graphql } from 'react-apollo';

interface CourthouseLocation {
    id: string;
    location: {
        id: string;
        name: string;
        description: string;
        address: string;
    };
}

export interface GetAllSheriffsProps {
    allSheriffs: {
        sheriffs: (Sheriff & { id: string, courthouse: CourthouseLocation })[];
    }
}

const GetAllSheriffs = gql`
  query{
    allSheriffs{
        sheriffs:nodes{
            badgeNumber:badgeNo,
            id:nodeId,
            firstName,
            lastName,
            sheriffId:userid,
            rank,
            courthouse:courthouseByLocationId{
                id:nodeId
                location:locationByLocationId{
                    id:nodeId
                    name:locationName,
                    description,
                    address
                }
            }
        }
    }
  }
`;

const updateSheriff = gql`
    mutation updateSheriff($nodeId: ID!,$sheriff: SheriffPatch!) {
        updateSheriff(input:{nodeId:$nodeId,sheriffPatch:$sheriff}) {
            sheriff{
                id:nodeId,
                firstName,
                lastName,
                badgeNumber:badgeNo               
            }
        }
  }
`;

export const withSheriffUpdater =
    graphql<{}, { field: keyof (Sheriff), nodeId: string, sheriff: Partial<Sheriff>, submit?: (sheriff: Partial<Sheriff>) => void }>(
        updateSheriff,
        {
            props: ({ mutate, ownProps: { nodeId } }) => (
                {
                    submit: (sheriff: Partial<Sheriff>) => (
                        mutate && mutate({ variables: { nodeId, sheriff } })
                    )
                }
            )
        });

export const withSheriffs = graphql<GetAllSheriffsProps>(GetAllSheriffs);
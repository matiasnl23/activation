export const GUID_MUTATION = `mutation {
  activation {
    id {
      guid: activationId
      secret: activationToken
    }
  } 
}`;

export const TOKEN_MUTATION = `mutation ($guid: String!, $secret: String!) {
  activation {
    info(activationId: $guid, activationToken: $secret) {
      token
    }
  }
}`;

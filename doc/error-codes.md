# API-Error Codes

## PacketParser (1000)

| Code | Message | Comments |
| --- | --- | --- |
| 1001 | API-Version mismatch | |
| 1002 | Missing Parameters | See provided Message for Information |
| 1003 | Methodname Invalid | |
| 1004 | Unknown Service | |
| 1005 | Unknown Method | |
| 1006 | Invalid Parameters | |
| 1007 | Invalid JSON | |

## Database (2000)

| Code | Message | Comments |
| --- | --- | --- |
| 2001 | Database not initialised | Please set database-driver before use |

## Sessions (3000)

| Code | Message | Comments |
| --- | --- | --- |
| 3001 | No Session for this Token found | |
| 3002 | User not found | |
| 3003 | User is corrupt | Should never exist; Please report |
| 3004 | Password is wrong | |
| 3005 | Already logged in | |
| 3006 | Unknown Error | |
| 3007 | Wrong Password | |
| 3008 | Not logged in! | |

## Users (4000)

| Code | Message | Comments |
| --- | --- | --- |
| 4001 | Lifetime is not valid | |
| 4002 | No active Session | |
| 4003 | E-Mail already exists | |
| 4004 | Unknown registration Error | |
| 4005 | Access Denied | |
| 4006 | User not found | |
| 4007 | Wrong password | |
| 4008 | Internal error | |
| 4009 | Please login first | |
| 4010 | Wrong search parameters | |

## Admins (5000)

| Code | Message | Comments |
| --- | --- | --- |
| 5001 | Access Denied | |
| 5002 | NEIN! | |
| 5003 | No active Session | |

## Access (6000)

| Code | Message | Comments |
| --- | --- | --- |
| 6001 | Invalid Arguments | |
| 6002 | One or more doorlocks not found | |
| 6003 | No Access found | |
| 6004 | Invalid Key | |
| 6005 | Access already exists | |

## Doorlock (7000)

| Code | Message | Comments |
| --- | --- | --- |
| 7001 | | |
| 7002 | | |
| 7003 | | |
| 7004 | Doorlock not found | |
| 7005 | Doorlock already exists | |

## Building (8000)

| Code | Message | Comments |
| --- | --- | --- |
| 8001 | Building already exists | |
| 8002 | Invalid Arguments | |
| 8003 | Building not found | |

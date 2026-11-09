import {z} from 'zod';

const providerId=z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
/** IDs are scoped to the connected organization, never names or source URLs. */
export const eventTagFilterSchema=z.object({
 organizationId:providerId,
 tagIds:z.array(providerId).min(1).max(50),
}).strict().superRefine((value,context)=>{
 if(new Set(value.tagIds).size!==value.tagIds.length)context.addIssue({code:'custom',path:['tagIds'],message:'Choose each event tag once.'});
});
export type EventTagFilter=z.infer<typeof eventTagFilterSchema>;

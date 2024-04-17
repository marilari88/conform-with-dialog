import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type { MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";

const teamSchema = z.object({
  coach: z.string(),
  players: z.array(z.object({ name: z.string(), goal: z.number() })),
});

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [form, { coach, players }] = useForm({
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: teamSchema });
    },
    onSubmit: (e, { submission }) => {
      if (submission?.status != "success") return;
      console.log(submission.value);
      e.preventDefault();
    },
    id: "team",
  });

  const playerList = players.getFieldList();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <Form {...getFormProps(form)}>
        <label htmlFor={coach.id}>coach:</label>{" "}
        <input {...getInputProps(coach, { type: "text" })} />
        <h2>Players</h2>
        {playerList.map((player, index) => {
          const { name, goal } = player.getFieldset();
          return (
            <div key={index}>
              {name.value} with {goal.value} goals
              <input {...getInputProps(name, { type: "hidden" })} />
              <input {...getInputProps(goal, { type: "hidden" })} />
            </div>
          );
        })}
        <Dialog.Root modal>
          <Dialog.Trigger>Add a player</Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay />
            <Dialog.Content>
              <AddPlayerForm
                onSubmit={(value) => {
                  form.insert({
                    name: players.name,
                    defaultValue: {
                      name: value.name,
                      goal: value.goal.toString(),
                    },
                  });
                }}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
        <button type="submit">Save the team</button>
      </Form>
    </div>
  );
}

const addPlayerSchema = teamSchema.shape.players.element;

type Player = z.infer<typeof addPlayerSchema>;

const AddPlayerForm = ({ onSubmit }: { onSubmit: (arg: Player) => void }) => {
  const [form, { name, goal }] = useForm({
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: addPlayerSchema });
    },
    onSubmit: (e, { submission }) => {
      if (submission?.status != "success") return;
      onSubmit(submission.value);
      e.preventDefault();
    },
    id: "addPlayer",
  });
  return (
    <div>
      <form {...getFormProps(form)}>
        <label htmlFor={name.id}>name:</label>{" "}
        <input {...getInputProps(name, { type: "text" })} />
        <label htmlFor={goal.id}>goal:</label>{" "}
        <input {...getInputProps(goal, { type: "number" })} />
        <button type="submit" name="intent" value="add">
          Add
        </button>
      </form>
    </div>
  );
};

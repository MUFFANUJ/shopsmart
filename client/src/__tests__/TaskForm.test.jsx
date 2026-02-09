import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';

describe('TaskForm', () => {
  it('shows validation error for blank title', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<TaskForm onSubmit={onSubmit} submitLabel="Create Task" />);

    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits normalized payload', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<TaskForm onSubmit={onSubmit} submitLabel="Create Task" />);

    await user.type(screen.getByLabelText(/title/i), '  Write documentation  ');
    await user.type(screen.getByLabelText(/description/i), '  Include setup and test steps  ');
    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Write documentation',
      description: 'Include setup and test steps',
      completed: false,
    });
  });
});

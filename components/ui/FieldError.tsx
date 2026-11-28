export default function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;

  return (
    <p id={id} className="mt-1.5 text-sm text-rose-300" role="alert">
      {message}
    </p>
  );
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimulatedTradesFilterProps {
	form: any;
	values: { page: number; dateFrom: string; dateTo: string };
	totalPages: number;
	canGoPrev: boolean;
	canGoNext: boolean;
}

export function SimulatedTradesFilter({
	form,
	values,
	totalPages,
	canGoPrev,
	canGoNext,
}: SimulatedTradesFilterProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="mb-4 grid gap-4 md:grid-cols-4 md:items-end"
		>
			<div className="space-y-1 md:col-span-1">
				<Label htmlFor="dateFrom">From</Label>
				<form.Field name="dateFrom">
					{(field: any) => (
						<Input
							id={field.name}
							type="date"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>
			</div>
			<div className="space-y-1 md:col-span-1">
				<Label htmlFor="dateTo">To</Label>
				<form.Field name="dateTo">
					{(field: any) => (
						<Input
							id={field.name}
							type="date"
							value={field.state.value ?? ""}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
						/>
					)}
				</form.Field>
			</div>
			<div className="flex items-center gap-2 md:col-span-2 md:justify-end">
				<Button
					variant="outline"
					type="button"
					size="sm"
					onClick={() => {
						form.setFieldValue("page", Math.max(1, values.page - 1));
					}}
					disabled={!canGoPrev}
				>
					Prev
				</Button>
				<span className="text-xs text-muted-foreground">
					Page {values.page} of {totalPages}
				</span>
				<Button
					variant="outline"
					type="button"
					size="sm"
					onClick={() => {
						form.setFieldValue("page", canGoNext ? values.page + 1 : values.page);
					}}
					disabled={!canGoNext}
				>
					Next
				</Button>
			</div>
		</form>
	);
}

export function PaginationInfo({ props }: { props?: { totalPages?: number; page?: number; totalRecords?: number } }) {
    return (<div className='ml-2 text-[hsl(var(--muted-foreground))]'>Exibindo página {props?.page} de {props?.totalPages} - Total de {props?.totalRecords} registros</div>)
}
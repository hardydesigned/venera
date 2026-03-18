update finance_transactions
set category_main = 'Standard',
    category_sub = null
where category_main is distinct from 'Standard'
   or category_sub is not null;

alter table finance_transactions
    drop constraint if exists finance_transactions_single_category_check;

alter table finance_transactions
    add constraint finance_transactions_single_category_check
    check (category_main is null or category_main = 'Standard');

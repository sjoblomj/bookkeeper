function accountPlanNumberToName(plan, accountPlans) {
    return accountPlans
        .filter(ap => ap.account_number === plan)
        .map(ap => ap.account_number + " - " + ap.name + " (" + ap.account_type + ")")[0];
}
function accountPlanNameToNumber(plan) {
    return plan.substring(0, plan.find(" - "));
}

function accountList(data) {
    let allInvolvedAccounts = new Set(data
        .filter(d => d.balance)
        .flatMap(d => d.balance.flatMap(b => [b.debit, b.credit])));

    function getAmount(debCred, type) {
        return [...allInvolvedAccounts]
            .map(accountNumber => {
                return {
                    "account": accountNumber, "type": type, "amount": data
                        .filter(d => d.balance)
                        .flatMap(d => d.balance)
                        .filter(b => debCred(b) === accountNumber)
                        .reduce((accumulator, b) => accumulator + b.amount, 0)
                }
            });
    }

    let debits = getAmount(b => b.debit, "debit");
    let credits = getAmount(b => b.credit, "credit");

    return debits.map((k, i) => [k, credits[i]])
        .map(a => {
            let debit = 0; credit = 0;
            let account = "";
            a.forEach(debcred => {
                account = debcred.account;
                if (debcred.type === "debit")
                    debit = debcred.amount;
                if (debcred.type === "credit")
                    credit = debcred.amount;
            });
            return {"account": account, "debit": debit, "credit": credit};
        });
}

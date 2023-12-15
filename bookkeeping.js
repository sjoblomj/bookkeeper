function accountPlanNumberToName(plan, accountPlans) {
    return accountPlans
        .filter(ap => ap.account_number === plan)
        .map(ap => ap.account_number + " - " + ap.name + " (" + ap.account_type + ")")[0];
}
function accountPlanNameToNumber(plan) {
    return plan.substring(0, plan.find(" - "));
}

function accountList(data, yearData) {
    let allInvolvedAccounts = new Set([
        data
            .filter(d => d.balance)
            .flatMap(d => d.balance.flatMap(b => [b.debit, b.credit])),
        yearData === undefined ? [] : yearData?.ingoing_balance.flatMap(ib => ib.account)
    ].flat());

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
            let debit = 0;
            let credit = 0;
            let account = "";
            a.forEach(debcred => {
                account = debcred.account;
                if (debcred.type === "debit")
                    debit = debcred.amount;
                if (debcred.type === "credit")
                    credit = debcred.amount;
            });
            return {"account": account, "debit": debit, "credit": credit};
        })
        .sort((a, b) => {
            if (a.account < b.account)
                return -1;
            else if (a.account > b.account)
                return 1;
            else
                return 0;
        });
}

function eventsForAccount(data, account) {
    return data
        .filter(d => d.balance)
        .filter(d => d.balance.filter(b => b.debit === account || b.credit === account).length > 0)
        .flatMap(d => {
            return d.balance.map(dc => {
                return {
                    "id": d.id,
                    "date": dc.date,
                    "description": d.description,
                    "debit": dc.debit === account ? dc.amount : 0,
                    "credit": dc.credit === account ? dc.amount : 0
                };
            })
                .filter(o => !(o.debit === 0 && o.credit === 0))
        });
}

function verifications(data, accountList) {
    return data.filter(d => accountList.includes(d.id));
}

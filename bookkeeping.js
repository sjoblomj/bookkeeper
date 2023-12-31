function accountPlanNumberToName(plan, accountPlans) {
    return accountPlans
        .filter(ap => ap.account_number === plan)
        .map(ap => ap.account_number + " - " + ap.name + " (" + ap.account_type + ")")[0];
}
function accountPlanNameToNumber(plan) {
    if (/^\d+$/.test(plan))
        return plan;
    return plan.substring(0, plan.search(" - "));
}
function verificationNameToNumber(plan) {
    if (/^([a-zA-Z0-9]+)$/.test(plan))
        return plan;
    return plan.substring(0, plan.search(" - "));
}

function balanceReport(data, yearData) {
    return balanceAndResultReport(data, yearData, "balance");
}
function resultReport(data, yearData) {
    return balanceAndResultReport(data, yearData, "result");
}

function balanceAndResultReport(data, yearData, type) {
    return accountList(data, yearData)
        .filter(v => type === "result" ? v.account >= 3000 : v.account < 3000)
        .map(v => {
            let cat = categoriseAccount(v.account);
            let ib = yearData.ingoing_balance
                .find(i => i.account === v.account)
                ?.amount || 0;
            return {
                "account": v.account,
                "account_class": cat.account_class,
                "account_group": cat.account_group,
                "debit": v.debit,
                "credit": v.credit,
                "period": type === "result" ? v.credit - v.debit : v.debit - v.credit,
                "ingoing_balance": ib
            };
        });
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

function setGroupedVerifications(data, verifications) {
    verifications = verifications.filter((value, index, array) => array.indexOf(value) === index); // Keep uniques

    function resetGroupedVerifications(id) {
        for (const d of data) {
            if (d.id === id) {
                let vs = d.grouped_verifications;
                d.grouped_verifications = undefined;
                if (vs)
                    vs.forEach(v => resetGroupedVerifications(v.verification));
            }
        }
    }
    verifications.forEach(v => resetGroupedVerifications(v));

    for (const d of data) {
        if (verifications.includes(d.id)) {
            d.grouped_verifications = verifications
                .filter(v => v !== d.id)
                .map(v => { return {"verification": v}});
        }
    }
}

function getProcessedVerifications(data) {
    return data
        .filter(d => d.balance)
        .map(d => d.id + " - " + d.description);
}

function getNextManualId(data) {
    let manualIds = data
        .filter(d => /^M[0-9]+$/.test(d.id))
        .map(d => d.id.trim())
        .map(d => d.substring(1));
    return 1 + (manualIds.length > 0 ? Math.max(... manualIds) : 0);
}

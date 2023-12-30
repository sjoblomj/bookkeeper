// https://bas.se/wp-content/uploads/2022/01/BAS-kontoplanens-indelning.pdf
function categoriseAccount(accountNumber) {
    let accountClass = "";
    let accountGroup = "";

    if (/1\d\d\d/.test(accountNumber)) {
        accountClass = "Tillgångar";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Immateriella anläggningstillgångar";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Byggnader och mark";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Maskiner och inventarier";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Finansiella anläggningstillgångar";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Lager, produkter i arbete och pågående arbeten";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Kundfordringar";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Övriga kortfristiga fordringar";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Förutbetalda kostnader och upplupna intäkter";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Kortfristiga placeringar";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Kassa och bank";
        }

    } else if (/2\d\d\d/.test(accountNumber)) {
        accountClass = "Eget kapital, avsättningar och skulder";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Eget kapital";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Obeskattade reserver";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Avsättningar";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Långfristiga skulder";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Kortfristiga skulder till kreditinstitut, kunder och leverantörer";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Skatteskulder";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Moms och särskilda punktskatter";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Personalens skatter, avgifter och löneavdrag";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Övriga kortfristiga skulder";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Upplupna kostnader och förutbetalda intäkter";
        }

    } else if (/3\d\d\d/.test(accountNumber)) {
        accountClass = "Rörelsens inkomster / intäkter";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Huvudintäkter";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Huvudintäkter";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Huvudintäkter";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Huvudintäkter";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Huvudintäkter";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Fakturerade kostnader";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Rörelsernas sidointäkter";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Intäktskorrigeringar";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Aktiverat arbete för egen räkning";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Övriga rörelseintäkter";
        }

    } else if (/4\d\d\d/.test(accountNumber)) {
        accountClass = "Utgifter/kostnader för varor, material och vissa köpta tjänster";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Inköp av varor och material";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Inköp av varor och material";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Inköp av varor och material";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Inköp av varor och material";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Inköp av varor och material";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Inköp av varor och material";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Legoarbeten, underentreprenader";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Reduktion av inköpspriset";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Förändring av lager, produkter i arbete och pågående arbeten";
        }

    } else if (/5\d\d\d/.test(accountNumber)) {
        accountClass = "Övriga externa rörelseutgifter/kostnader";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Lokalkostnader";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Fastighetskostnader";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Hyra av anläggningstillgångar";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Energikostnader";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Förbrukningsinventarier och förbrukningsmaterial";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Reparation och underhåll";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Kostnader för transportmedel";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Frakter och transporter";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Resekostnader";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Reklam och PR";
        }

    } else if (/6\d\d\d/.test(accountNumber)) {
        accountClass = "Övriga externa rörelseutgifter/kostnader";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Övriga försäljningskostnader";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Kontorsmateriel och trycksaker";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Tele och post";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Företagsförsäkringar och övriga riskkostnader";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Förvaltningskostnader";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Övriga externa tjänster";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Inhyrd personal";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Övriga externa kostnader";
        }

    } else if (/7\d\d\d/.test(accountNumber)) {
        accountClass = "Utgifter/kostnader för personal, avskrivningar mm";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Löner till kollektivanställda";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Löner till tjänstemän och företagsledare";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Kostnadsersättningar och förmåner";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Pensionskostnader";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Sociala och andra avgifter enligt lag och avtal";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Övriga personalkostnader";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Nedskrivningar och återföring av nedskrivningar";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Avskrivningar enligt plan";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Övriga rörelsekostnader";
        }

    } else if (/8\d\d\d/.test(accountNumber)) {
        accountClass = "Finansiella och andra inkomster/intäkter och utgifter/kostnader samt skatte- och resultatkonton";
        if (/\d0\d\d/.test(accountNumber)) {
            accountGroup = "Resultat från andelar i koncernföretag";
        } else if (/\d1\d\d/.test(accountNumber)) {
            accountGroup = "Resultat från andelar i intresseföretag, m.fl.";
        } else if (/\d2\d\d/.test(accountNumber)) {
            accountGroup = "Resultat från övriga värdepapper och långfristiga fordringar";
        } else if (/\d3\d\d/.test(accountNumber)) {
            accountGroup = "Övriga ränteintäkter och liknande resultatposter";
        } else if (/\d4\d\d/.test(accountNumber)) {
            accountGroup = "Räntekostnader och liknande resultatposter";
        } else if (/\d5\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d6\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d7\d\d/.test(accountNumber)) {
            accountGroup = "Övrigt";
        } else if (/\d8\d\d/.test(accountNumber)) {
            accountGroup = "Bokslutsdispositioner";
        } else if (/\d9\d\d/.test(accountNumber)) {
            accountGroup = "Skatter och årets resultat";
        }
    }

    return {
        "account_number": accountNumber,
        "account_class": accountClass,
        "account_group": accountGroup
    };
}
